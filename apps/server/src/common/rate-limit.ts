// In-process token bucket — port of apps/commerce/src/lib/rate-limit.ts.
// Single-instance only (no Redis); good enough for the development cluster and
// MVP launch. For horizontal scale-out, swap for a Redis-backed implementation.

type Bucket = { count: number; resetAt: number };

const DEFAULT_WINDOW_MS = 5 * 60 * 1000;
const DEFAULT_MAX_REQ = 10;
const MAX_ENTRIES = 5000;

const buckets = new Map<string, Bucket>();

function evict(now: number) {
  if (buckets.size < MAX_ENTRIES) return;
  for (const [k, v] of buckets) {
    if (v.resetAt <= now) buckets.delete(k);
    if (buckets.size < MAX_ENTRIES * 0.8) break;
  }
}

export interface RateLimitConfig {
  windowMs?: number;
  max?: number;
}

export function rateLimit(
  key: string,
  config?: RateLimitConfig
): { ok: boolean; retryAfterSec: number } {
  const windowMs = config?.windowMs ?? DEFAULT_WINDOW_MS;
  const max = config?.max ?? DEFAULT_MAX_REQ;
  const now = Date.now();
  evict(now);
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  if (bucket.count >= max) {
    return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  bucket.count += 1;
  return { ok: true, retryAfterSec: 0 };
}
