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

// UUID-only path param for mutations (we always update by canonical id).
export const PostUuidParamSchema = z.object({
  id: z.string().uuid(),
});

const PostImageSchema = z.object({
  url: z.string().min(1).max(2000),
  alt: z.string().max(280).default(''),
});

const TITLE_MAX = 120;
const CONTENT_MAX = 8000;
const DOG_BREED_MAX = 50;
const MAX_IMAGES = 6;
const MAX_PRODUCTS = 5;

export const BoardEnum = z.enum(['DAILY', 'STYLE', 'TIP', 'QUESTION']);

export const CreatePostBodySchema = z.object({
  board_type: BoardEnum,
  title: z.string().trim().min(1).max(TITLE_MAX),
  content: z.string().trim().min(1).max(CONTENT_MAX),
  dog_breed: z.string().max(DOG_BREED_MAX).nullable().optional(),
  images: z.array(PostImageSchema).max(MAX_IMAGES).optional(),
  product_ids: z.array(z.string().uuid()).max(MAX_PRODUCTS).optional(),
});

export const UpdatePostBodySchema = CreatePostBodySchema;
