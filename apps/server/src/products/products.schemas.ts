import { z } from 'zod';

// Shared schemas — used by both controller validation and (potentially)
// client-side narrowing. Kept in one place so contract changes are atomic.

// PostgREST uses commas as filter separators; we accept comma-joined strings
// in query params and split into arrays here for ergonomics.
const csv = z
  .string()
  .optional()
  .transform((s) =>
    s
      ? s
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean)
      : undefined
  );

const intParam = z
  .string()
  .optional()
  .transform((s) => (s ? parseInt(s, 10) : undefined))
  .pipe(z.number().int().positive().optional());

export const ListProductsQuerySchema = z.object({
  category_slug: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'SOLD_OUT', 'HIDDEN', 'DISCONTINUED']).optional(),
  featured: z
    .string()
    .optional()
    .transform((s) => (s === 'true' ? true : s === 'false' ? false : undefined)),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'popular']).optional(),
  page: intParam,
  per_page: intParam,
  size_labels: csv,
  colors: csv,
  min_price_krw: intParam,
  max_price_krw: intParam,
  q: z.string().max(100).optional(),
});

export const FeaturedQuerySchema = z.object({
  limit: intParam,
});

export const ByIdsQuerySchema = z.object({
  ids: z
    .string()
    .min(1, 'ids required')
    .transform((s) =>
      s
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
    ),
});

export const SearchForPostQuerySchema = z.object({
  q: z.string().min(1).max(100),
  exclude: csv.transform((arr) => arr ?? []),
});

export const IdOrSlugParamSchema = z.object({
  idOrSlug: z.string().min(1).max(100),
});

// UUID detect helper for routes that accept either id or slug under the same path.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (s: string): boolean => UUID_RE.test(s);
