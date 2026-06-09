import { z } from 'zod';

const intParam = z
  .string()
  .optional()
  .transform((s) => (s ? parseInt(s, 10) : undefined))
  .pipe(z.number().int().positive().optional());

const boolParam = z
  .string()
  .optional()
  .transform((s) => (s === 'true' ? true : s === 'false' ? false : undefined));

export const ListPostsQuerySchema = z.object({
  board_type: z.enum(['ALL', 'DAILY', 'STYLE', 'TIP', 'QUESTION']).optional(),
  q: z.string().max(100).optional(),
  sort: z.enum(['newest', 'popular']).optional(),
  page: intParam,
  per_page: intParam,
  mentions_product_id: z.string().uuid().optional(),
  /** Auth-required filter: return only the authenticated user's own posts. */
  mine: boolParam,
  /** Auth-required filter: return only posts the authenticated user has liked. */
  liked: boolParam,
});

export const PostIdParamSchema = z.object({
  // Accepts either UUID or short_id (8-hex-char public lookup key).
  idOrShortId: z.string().min(1).max(64),
});
