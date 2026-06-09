// Slug generator — mirrors apps/commerce/src/lib/community/slug.ts so app
// and DB (Postgres posts_generate_slug fn) stay in sync.

const SLUG_MAX_LENGTH = 120;
const SLUG_FALLBACK = 'post';

export function generateSlug(title: string): string {
  let s = (title ?? '')
    .replace(/[^a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ\s\-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  if (!s) s = SLUG_FALLBACK;
  return s.slice(0, SLUG_MAX_LENGTH);
}
