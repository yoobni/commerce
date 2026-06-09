import { z } from 'zod';

export const PostIdPathSchema = z.object({
  postId: z.string().uuid(),
});

export const CommentIdPathSchema = z.object({
  commentId: z.string().uuid(),
});
