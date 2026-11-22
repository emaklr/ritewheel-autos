import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createInMemoryRateLimiter,
  createRateLimitChecker,
} from "./rate-limit-core";

test("the development fallback enforces the configured limit and resets its window", () => {
  let now = 1_000;
  const fallback = createInMemoryRateLimiter(() => now);

  assert.deepEqual(fallback("client-a", 2, 2_000), {
    allowed: true,
    retryAfterSeconds: 0,
    unavailable: false,
  });
  assert.equal(fallback("client-a", 2, 2_000).allowed, true);

  const blocked = fallback("client-a", 2, 2_000);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.retryAfterSeconds, 2);

  now = 3_001;
  assert.equal(fallback("client-a", 2, 2_000).allowed, true);
});

test("a successful distributed check allows the request", async () => {
  const check = createRateLimitChecker({
    isProduction: true,
    hasCredentials: () => true,
    getLimiter: () => ({ limit: async () => ({ success: true, reset: 0 }) }),
    fallback: () => {
      throw new Error("Production must not use the local fallback.");
    },
  });

  assert.deepEqual(await check("opaque-client-key", 5, 60_000), {
    allowed: true,
    retryAfterSeconds: 0,
    unavailable: false,
  });
});

test("a distributed denial returns a retry interval", async () => {
  const check = createRateLimitChecker({
    isProduction: true,
    hasCredentials: () => true,
    getLimiter: () => ({ limit: async () => ({ success: false, reset: 2_501 }) }),
    fallback: () => {
      throw new Error("Production must not use the local fallback.");
    },
    now: () => 1_000,
  });

  assert.deepEqual(await check("opaque-client-key", 5, 60_000), {
    allowed: false,
    retryAfterSeconds: 2,
    unavailable: false,
  });
});

test("production fails closed when credentials are missing", async () => {
  let fallbackCalled = false;
  const check = createRateLimitChecker({
    isProduction: true,
    hasCredentials: () => false,
    getLimiter: () => {
      throw new Error("The limiter should not be constructed.");
    },
    fallback: () => {
      fallbackCalled = true;
      return { allowed: true, retryAfterSeconds: 0, unavailable: false };
    },
  });

  assert.deepEqual(await check("opaque-client-key", 5, 60_000), {
    allowed: false,
    retryAfterSeconds: 30,
    unavailable: true,
  });
  assert.equal(fallbackCalled, false);
});

test("production fails closed when Redis is unavailable", async () => {
  let fallbackCalled = false;
  const check = createRateLimitChecker({
    isProduction: true,
    hasCredentials: () => true,
    getLimiter: () => ({
      limit: async () => {
        throw new Error("Redis unavailable");
      },
    }),
    fallback: () => {
      fallbackCalled = true;
      return { allowed: true, retryAfterSeconds: 0, unavailable: false };
    },
  });

  assert.deepEqual(await check("opaque-client-key", 5, 60_000), {
    allowed: false,
    retryAfterSeconds: 30,
    unavailable: true,
  });
  assert.equal(fallbackCalled, false);
});

test("local development uses the in-memory fallback when credentials are missing", async () => {
  const fallback = createInMemoryRateLimiter();
  const check = createRateLimitChecker({
    isProduction: false,
    hasCredentials: () => false,
    getLimiter: () => {
      throw new Error("The distributed limiter should not be constructed.");
    },
    fallback,
  });

  assert.equal((await check("client-a", 1, 60_000)).allowed, true);
  assert.equal((await check("client-a", 1, 60_000)).allowed, false);
});

test("local development may fall back when Redis is unavailable", async () => {
  const fallback = createInMemoryRateLimiter();
  const check = createRateLimitChecker({
    isProduction: false,
    hasCredentials: () => true,
    getLimiter: () => ({
      limit: async () => {
        throw new Error("Redis unavailable");
      },
    }),
    fallback,
  });

  assert.equal((await check("client-a", 1, 60_000)).allowed, true);
  assert.equal((await check("client-a", 1, 60_000)).allowed, false);
});

test("invalid rate-limit policies are rejected", async () => {
  const check = createRateLimitChecker({
    isProduction: true,
    hasCredentials: () => false,
    getLimiter: () => {
      throw new Error("The limiter should not be constructed.");
    },
    fallback: createInMemoryRateLimiter(),
  });

  await assert.rejects(check("client-a", 0, 60_000), RangeError);
  await assert.rejects(check("client-a", 1, 0), RangeError);
});
