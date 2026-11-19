import "server-only";

import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const NVIDIA_NIM_BASE_URL = "https://integrate.api.nvidia.com/v1";
const CONCIERGE_MODEL_ID = "nvidia/nemotron-3.5-super-vl-120b-a12b";

/**
 * Keep the model provider isolated from the Concierge route so the model can
 * be replaced without changing inventory tools, request validation, or UI.
 */
export function getConciergeModel() {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    throw new Error("NVIDIA_API_KEY is not configured.");
  }

  const nim = createOpenAICompatible({
    name: "nim",
    baseURL: NVIDIA_NIM_BASE_URL,
    apiKey,
  });

  return nim.chatModel(CONCIERGE_MODEL_ID);
}
