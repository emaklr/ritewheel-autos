import "server-only";

import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type {
  LanguageModelV4,
  LanguageModelV4CallOptions,
  LanguageModelV4Middleware,
  LanguageModelV4StreamPart,
  LanguageModelV4StreamResult,
} from "@ai-sdk/provider";
import { wrapLanguageModel } from "ai";

const DEFAULT_PROVIDER_ORDER = ["nvidia", "openrouter", "groq"] as const;
const FIRST_RESPONSE_TIMEOUT_MS = 5_000;
const PROVIDER_COOLDOWN_MS = 90_000;

type ProviderId = (typeof DEFAULT_PROVIDER_ORDER)[number];

type ProviderCandidate = {
  id: ProviderId;
  modelId: string;
  model: LanguageModelV4;
};

const providerCooldowns = new Map<ProviderId, number>();

function readProviderOrder(): ProviderId[] {
  const configured = process.env.RITEWHEEL_AI_PROVIDER_ORDER;
  if (!configured?.trim()) return [...DEFAULT_PROVIDER_ORDER];

  const allowed = new Set<ProviderId>(DEFAULT_PROVIDER_ORDER);
  const unique = new Set<ProviderId>();

  for (const entry of configured.split(",")) {
    const value = entry.trim().toLowerCase();
    if (allowed.has(value as ProviderId)) unique.add(value as ProviderId);
  }

  return unique.size > 0 ? [...unique] : [...DEFAULT_PROVIDER_ORDER];
}

function configuredModel(value: string | undefined, fallback: string) {
  return value?.trim() || fallback;
}

function createConfiguredProviders(): ProviderCandidate[] {
  const candidates: ProviderCandidate[] = [];

  for (const id of readProviderOrder()) {
    const nvidiaApiKey = process.env.NVIDIA_API_KEY?.trim();
    const openRouterApiKey = process.env.OPENROUTER_API_KEY?.trim();
    const groqApiKey = process.env.GROQ_API_KEY?.trim();

    if (id === "nvidia" && nvidiaApiKey) {
      const modelId = configuredModel(
        process.env.NVIDIA_MODEL,
        "nvidia/nemotron-3.5-super-vl-120b-a12b",
      );
      const provider = createOpenAICompatible({
        name: "nvidia-nim",
        baseURL: "https://integrate.api.nvidia.com/v1",
        apiKey: nvidiaApiKey,
      });
      candidates.push({ id, modelId, model: provider.chatModel(modelId) });
    }

    if (id === "openrouter" && openRouterApiKey) {
      const modelId = configuredModel(process.env.OPENROUTER_MODEL, "openrouter/free");
      const provider = createOpenAICompatible({
        name: "openrouter",
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: openRouterApiKey,
      });
      candidates.push({ id, modelId, model: provider.chatModel(modelId) });
    }

    if (id === "groq" && groqApiKey) {
      const modelId = configuredModel(process.env.GROQ_MODEL, "openai/gpt-oss-120b");
      const provider = createOpenAICompatible({
        name: "groq",
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: groqApiKey,
      });
      candidates.push({ id, modelId, model: provider.chatModel(modelId) });
    }
  }

  return candidates;
}

export function isConciergeConfigured() {
  return createConfiguredProviders().length > 0;
}

function getHttpStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;

  const value = error as {
    status?: unknown;
    statusCode?: unknown;
    response?: { status?: unknown };
  };
  const status = value.status ?? value.statusCode ?? value.response?.status;
  return typeof status === "number" ? status : undefined;
}

function recordProviderFailure(candidate: ProviderCandidate, error: unknown) {
  providerCooldowns.set(candidate.id, Date.now() + PROVIDER_COOLDOWN_MS);
  console.warn("Concierge provider entered a temporary cooldown.", {
    provider: candidate.id,
    model: candidate.modelId,
    status: getHttpStatus(error) ?? null,
  });
}

function recordProviderSuccess(candidate: ProviderCandidate) {
  providerCooldowns.delete(candidate.id);
}

function getAttemptOrder(candidates: ProviderCandidate[]) {
  const now = Date.now();
  const available = candidates.filter(
    (candidate) => (providerCooldowns.get(candidate.id) ?? 0) <= now,
  );

  if (available.length > 0) return available;

  // If every provider is cooling down, probe the one whose cooldown expires first.
  return [...candidates].sort(
    (left, right) =>
      (providerCooldowns.get(left.id) ?? 0) -
      (providerCooldowns.get(right.id) ?? 0),
  );
}

function beforeDeadline<T>(promise: PromiseLike<T>, deadline: number) {
  const remaining = deadline - Date.now();
  if (remaining <= 0) {
    return Promise.reject(new Error("Provider did not begin responding in time."));
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error("Provider did not begin responding in time.")),
      remaining,
    );
  });

  return Promise.race([Promise.resolve(promise), timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

function isMeaningfulOutput(part: LanguageModelV4StreamPart) {
  return (
    part.type === "text-start" ||
    part.type === "text-delta" ||
    part.type === "text-end" ||
    part.type === "reasoning-start" ||
    part.type === "reasoning-delta" ||
    part.type === "reasoning-end" ||
    part.type === "tool-input-start" ||
    part.type === "tool-input-delta" ||
    part.type === "tool-input-end" ||
    part.type === "tool-call" ||
    part.type === "tool-result" ||
    part.type === "file" ||
    part.type === "reasoning-file" ||
    part.type === "source" ||
    part.type === "custom"
  );
}

function replayStream(
  buffered: LanguageModelV4StreamPart[],
  reader: ReadableStreamDefaultReader<LanguageModelV4StreamPart>,
  candidate: ProviderCandidate,
  callerSignal?: AbortSignal,
): ReadableStream<LanguageModelV4StreamPart> {
  let index = 0;

  return new ReadableStream<LanguageModelV4StreamPart>({
    async pull(controller) {
      if (index < buffered.length) {
        controller.enqueue(buffered[index]);
        index += 1;
        return;
      }

      try {
        const next = await reader.read();
        if (next.done) {
          reader.releaseLock();
          controller.close();
          return;
        }

        if (next.value.type === "error" && !callerSignal?.aborted) {
          recordProviderFailure(candidate, next.value.error);
        }

        controller.enqueue(next.value);
      } catch (error) {
        if (!callerSignal?.aborted) recordProviderFailure(candidate, error);
        controller.error(error);
      }
    },

    async cancel(reason) {
      await reader.cancel(reason);
      reader.releaseLock();
    },
  });
}

async function streamWithFallback(
  candidates: ProviderCandidate[],
  params: LanguageModelV4CallOptions,
): Promise<LanguageModelV4StreamResult> {
  const errors: unknown[] = [];

  for (const candidate of getAttemptOrder(candidates)) {
    if (params.abortSignal?.aborted) {
      throw new Error("The Concierge request was cancelled.");
    }

    const deadline = Date.now() + FIRST_RESPONSE_TIMEOUT_MS;
    const providerAbort = new AbortController();
    const abortSignal = params.abortSignal
      ? AbortSignal.any([params.abortSignal, providerAbort.signal])
      : providerAbort.signal;
    const timeout = setTimeout(
      () => providerAbort.abort(new Error("Provider first-response timeout.")),
      FIRST_RESPONSE_TIMEOUT_MS,
    );

    let reader: ReadableStreamDefaultReader<LanguageModelV4StreamPart> | null = null;

    try {
      const { stream, ...result } = await beforeDeadline(
        candidate.model.doStream({ ...params, abortSignal }),
        deadline,
      );
      reader = stream.getReader();

      const buffered: LanguageModelV4StreamPart[] = [];

      while (true) {
        const next = await beforeDeadline(reader.read(), deadline);

        if (next.done) {
          clearTimeout(timeout);
          recordProviderSuccess(candidate);
          return {
            ...result,
            stream: replayStream(buffered, reader, candidate, params.abortSignal),
          };
        }

        if (next.value.type === "error" && !buffered.some(isMeaningfulOutput)) {
          throw next.value.error;
        }

        buffered.push(next.value);

        if (isMeaningfulOutput(next.value)) {
          clearTimeout(timeout);
          recordProviderSuccess(candidate);
          return {
            ...result,
            stream: replayStream(buffered, reader, candidate, params.abortSignal),
          };
        }
      }
    } catch (error) {
      clearTimeout(timeout);
      providerAbort.abort(error);

      if (reader) {
        await reader.cancel(error).catch(() => undefined);
      }

      if (params.abortSignal?.aborted) throw error;

      errors.push(error);
      recordProviderFailure(candidate, error);
      console.warn("Concierge is trying the next configured provider.", {
        failedProvider: candidate.id,
        failedModel: candidate.modelId,
        status: getHttpStatus(error) ?? null,
      });
    }
  }

  throw errors[errors.length - 1] ?? new Error("No configured Concierge provider is available.");
}

function generateWithFallback(
  candidates: ProviderCandidate[],
  params: LanguageModelV4CallOptions,
) {
  return (async () => {
    const errors: unknown[] = [];

    for (const candidate of getAttemptOrder(candidates)) {
      if (params.abortSignal?.aborted) {
        throw new Error("The Concierge request was cancelled.");
      }

      try {
        const result = await candidate.model.doGenerate(params);
        recordProviderSuccess(candidate);
        return result;
      } catch (error) {
        if (params.abortSignal?.aborted) throw error;
        errors.push(error);
        recordProviderFailure(candidate, error);
      }
    }

    throw errors[errors.length - 1] ?? new Error("No configured Concierge provider is available.");
  })();
}

/**
 * Providers are tried in RITEWHEEL_AI_PROVIDER_ORDER. A provider is cooled down
 * briefly after an upstream error, so the next request can prefer a healthy
 * backup. The cooldown is best-effort per warm serverless instance, not shared
 * across all Vercel instances.
 *
 * Streaming failover only happens before the first meaningful text, reasoning,
 * or tool output is emitted. Switching after that point could duplicate text
 * or repeat a tool call in the customer's conversation.
 */
export function getConciergeModel() {
  const candidates = createConfiguredProviders();
  if (candidates.length === 0) {
    throw new Error("No Concierge model provider is configured.");
  }

  const middleware: LanguageModelV4Middleware = {
    specificationVersion: "v4",
    wrapGenerate: ({ params }) => generateWithFallback(candidates, params),
    wrapStream: ({ params }) => streamWithFallback(candidates, params),
  };

  return wrapLanguageModel({
    model: candidates[0].model,
    middleware,
  });
}
