import "server-only";

import { createHmac } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import {
  createInMemoryRateLimiter,
  createRateLimitChecker,
} from "@/lib/rate-limit-core";

const isProduction = process.env.NODE_ENV === "production";
const localFallback = createInMemoryRateLimiter();
const limiters = new Map<string, Ratelimit>();

let redisClient: Redis | undefined;
let warnedAboutUnavailable = false;
let warnedAboutLocalFallback = false;

function hasUpstashCredentials(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
  );
}

function getRedisClient(): Redis {
  if (redisClient) return redisClient;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error("Upstash rate-limiting credentials are not configured.");
  }

  redisClient = new Redis({ url, token, enableTelemetry: false });
  return redisClient;
}

function getDistributedLimiter(limit: number, windowMs: number): Ratelimit {
  const cacheKey = `${limit}:${windowMs}`;
  const existing = limiters.get(cacheKey);
  if (existing) return existing;

  const environment =
    process.env.VERCEL_ENV ??
    (isProduction ? "production" : "development");

  const limiter = new Ratelimit({
    redis: getRedisClient(),
    limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
    prefix: `ritewheel:${environment}:rate-limit:${limit}:${windowMs}`,
    ephemeralCache: false,
    // Upstash's default timeout is fail-open. Disable it so timeouts reach
    // the adapter's fail-closed handling in deployed production/preview.
    timeout: 0,
    analytics: false,
    enableTelemetry: false,
  });

  limiters.set(cacheKey, limiter);
  return limiter;
}

const checkWithFallback = createRateLimitChecker({
  isProduction,
  hasCredentials: hasUpstashCredentials,
  getLimiter: getDistributedLimiter,
  fallback: localFallback,
});

function hashIdentifier(key: string): string {
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!token) return key;

  const environment =
    process.env.VERCEL_ENV ??
    (isProduction ? "production" : "development");

  return createHmac("sha256", token)
    .update(`${environment}:${key}`)
    .digest("hex");
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
) {
  const result = await checkWithFallback(hashIdentifier(key), limit, windowMs);

  if (result.unavailable && !warnedAboutUnavailable) {
    warnedAboutUnavailable = true;
    console.error("Ritewheel distributed rate limiting is unavailable; the request was rejected.");
  }

  if (!isProduction && !hasUpstashCredentials() && !warnedAboutLocalFallback) {
    warnedAboutLocalFallback = true;
    console.warn("Ritewheel local development is using process-local rate limiting because Upstash credentials are not configured.");
  }

  return result;
}
