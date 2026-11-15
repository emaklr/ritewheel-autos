type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5_000;

/**
 * Best-effort process-local rate limiter.
 *
 * This protects a single running instance against accidental rapid repeats.
 * Serverless instances do not share memory, so production traffic must also be
 * protected by a distributed edge/provider rate limiter before public launch.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
  } else if (current.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  } else {
    current.count += 1;
  }

  if (buckets.size > MAX_BUCKETS) {
    for (const [entryKey, bucket] of buckets) {
      if (bucket.resetAt <= now || buckets.size > MAX_BUCKETS) {
        buckets.delete(entryKey);
      }
      if (buckets.size <= MAX_BUCKETS) break;
    }
  }

  return { allowed: true, retryAfterSeconds: 0 };
}
