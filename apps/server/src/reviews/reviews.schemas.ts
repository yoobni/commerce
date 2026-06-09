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

export const ListReviewsQuerySchema = z.object({
  product_id: z.string().uuid(),
  page: intParam,
  per_page: intParam,
  photo_only: boolParam,
});

export const StatsQuerySchema = z.object({
  product_id: z.string().uuid(),
});

export const CreateReviewBodySchema = z.object({
  product_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  content: z.string().trim().min(1).max(2000),
  purchased_size: z.string().min(1).max(16),
  size_feedback: z.enum(['SMALL', 'PERFECT', 'LARGE']),
  dog_breed: z.string().max(50).nullable().optional(),
  dog_weight_kg: z.number().positive().max(200).nullable().optional(),
});
