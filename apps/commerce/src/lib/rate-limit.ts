type Bucket = { count: number; resetAt: number };

const DEFAULT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
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
  /** Window length in ms. Defaults to 5 minutes. */
  windowMs?: number;
  /** Max requests per window. Defaults to 10. */
  max?: number;
}

export function rateLimit(
  key: string,
  config?: RateLimitConfig,
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

export function getClientIp(headers: Headers): string {
  const xff = headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]?.trim() ?? 'unknown';
  return headers.get('x-real-ip') ?? 'unknown';
}
