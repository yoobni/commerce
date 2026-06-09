import { z } from 'zod';

const intParam = z
  .string()
  .optional()
  .transform((s) => (s ? parseInt(s, 10) : undefined))
  .pipe(z.number().int().positive().optional());

export const PostIdPathSchema = z.object({
  postId: z.string().uuid(),
});

export const CommentIdPathSchema = z.object({
  id: z.string().uuid(),
});

export const ListCommentsQuerySchema = z.object({
  page: intParam,
  per_page: intParam,
});

export const CreateCommentBodySchema = z.object({
  content: z.string().trim().min(1).max(1000),
  parent_id: z.string().uuid().nullable().optional(),
});

export const UpdateCommentBodySchema = z.object({
  content: z.string().trim().min(1).max(1000),
});
