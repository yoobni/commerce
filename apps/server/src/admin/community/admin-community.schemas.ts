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

export const AdminListPostsQuerySchema = z.object({
  status: z.enum(['ALL', 'ACTIVE', 'HIDDEN', 'DELETED']).optional(),
  board_type: z.enum(['ALL', 'DAILY', 'STYLE', 'TIP', 'QUESTION']).optional(),
  is_pinned: boolParam,
  search: z.string().max(100).optional(),
  page: intParam,
  per_page: intParam,
});

export const PostStatusBodySchema = z.object({
  status: z.enum(['ACTIVE', 'HIDDEN', 'DELETED']),
});

export const PostPinBodySchema = z.object({
  is_pinned: z.boolean(),
});

export const CommentStatusBodySchema = z.object({
  status: z.enum(['ACTIVE', 'HIDDEN', 'DELETED']),
});

export const UuidParamSchema = z.object({ id: z.string().uuid() });
