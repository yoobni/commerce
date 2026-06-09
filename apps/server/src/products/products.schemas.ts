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

// One unified list query — every filter & search & id-batch goes through here
// per REST convention (no action-style endpoints like /search or /by-ids).
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
  /** Restrict to these product ids (used by community "mentioned products"). */
  ids: csv,
  /** Exclude these product ids (used by ProductSelector typeahead). */
  exclude: csv,
});

export const SlugParamSchema = z.object({
  slug: z.string().min(1).max(160),
});

export const UuidParamSchema = z.object({
  id: z.string().uuid(),
});
