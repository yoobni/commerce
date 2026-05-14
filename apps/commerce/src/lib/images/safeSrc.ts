/**
 * Returns a safe `<Image>` src.
 * - allows app-relative paths (/...)
 * - allows the configured Supabase storage host
 * - returns the fallback for anything else (external mock URLs in seed data,
 *   broken/null values, etc.) so next/image never sees an unconfigured host.
 */
export const FALLBACK_THUMB =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><rect width='400' height='400' fill='#eeeae3'/><text x='50%' y='50%' fill='#a89a85' font-family='sans-serif' font-size='18' text-anchor='middle' dominant-baseline='middle'>RAVI</text></svg>"
  );

function getAllowedHost(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export function safeImageSrc(src: string | null | undefined): string {
  if (!src) return FALLBACK_THUMB;
  if (src.startsWith('/')) return src;
  if (src.startsWith('data:')) return src;
  try {
    const u = new URL(src);
    const allowed = getAllowedHost();
    if (allowed && (u.hostname === allowed || u.hostname.endsWith('.supabase.co'))) {
      return src;
    }
  } catch {
    // fall through
  }
  return FALLBACK_THUMB;
}

export function isFallback(src: string): boolean {
  return src === FALLBACK_THUMB;
}
