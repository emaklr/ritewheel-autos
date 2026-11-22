export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
  unavailable: boolean;
};

export type DistributedRateLimitResponse = {
  success: boolean;
  reset: number;
};

export type DistributedRateLimiter = {
  limit(identifier: string): Promise<DistributedRateLimitResponse>;
};

export type RateLimitFallback = (
  key: string,
  limit: number,
  windowMs: number,
) => RateLimitResult;

export function createInMemoryRateLimiter(now: () => number = Date.now): RateLimitFallback {
  type Bucket = { count: number; resetAt: number };

  const buckets = new Map<string, Bucket>();
  const maxBuckets = 5_000;

  return (key, limit, windowMs) => {
    const currentTime = now();
    const current = buckets.get(key);

    if (!current || current.resetAt <= currentTime) {
      buckets.set(key, { count: 1, resetAt: currentTime + windowMs });
    } else if (current.count >= limit) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - currentTime) / 1000)),
        unavailable: false,
      };
    } else {
      current.count += 1;
    }

    if (buckets.size > maxBuckets) {
      for (const [entryKey, bucket] of buckets) {
        if (bucket.resetAt <= currentTime || buckets.size > maxBuckets) {
          buckets.delete(entryKey);
        }
        if (buckets.size <= maxBuckets) break;
      }
    }

    return { allowed: true, retryAfterSeconds: 0, unavailable: false };
  };
}

export function createRateLimitChecker(dependencies: {
  isProduction: boolean;
  hasCredentials: () => boolean;
  getLimiter: (limit: number, windowMs: number) => DistributedRateLimiter;
  fallback: RateLimitFallback;
  now?: () => number;
}) {
  const now = dependencies.now ?? Date.now;

  return async (key: string, limit: number, windowMs: number): Promise<RateLimitResult> => {
    if (!Number.isSafeInteger(limit) || limit < 1) {
      throw new RangeError("Rate limit must be a positive integer.");
    }
    if (!Number.isSafeInteger(windowMs) || windowMs < 1) {
      throw new RangeError("Rate-limit window must be a positive integer in milliseconds.");
    }

    if (!dependencies.hasCredentials()) {
      return dependencies.isProduction
        ? { allowed: false, retryAfterSeconds: 30, unavailable: true }
        : dependencies.fallback(key, limit, windowMs);
    }

    try {
      const result = await dependencies.getLimiter(limit, windowMs).limit(key);

      if (result.success) {
        return { allowed: true, retryAfterSeconds: 0, unavailable: false };
      }

      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((result.reset - now()) / 1000)),
        unavailable: false,
      };
    } catch {
      return dependencies.isProduction
        ? { allowed: false, retryAfterSeconds: 30, unavailable: true }
        : dependencies.fallback(key, limit, windowMs);
    }
  };
}
