/**
 * Extract a clean, SEO-safe excerpt from user-generated post content.
 *
 * UGC content is plain text (newlines preserved as-is in the body). For meta
 * descriptions, OG descriptions, and JSON-LD we want a single-line summary
 * that's safe to drop into attributes — no HTML, no quotes weirdness, no
 * runaway whitespace.
 */

const DEFAULT_LENGTH = 160;

export function extractExcerpt(content: string, maxLength: number = DEFAULT_LENGTH): string {
  if (!content) return '';

  // 1) drop any HTML-ish tags users may have pasted (`<script>` etc.)
  //    not a sanitizer — just a safety net for excerpt strings
  let s = content.replace(/<[^>]*>/g, '');

  // 2) collapse all whitespace (incl. newlines) to single space
  s = s.replace(/\s+/g, ' ').trim();

  if (s.length <= maxLength) return s;

  // 3) cut at word boundary near maxLength, then add ellipsis
  const cut = s.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  const ellipsis = '…';
  if (lastSpace > maxLength * 0.6) {
    return cut.slice(0, lastSpace) + ellipsis;
  }
  return cut + ellipsis;
}
