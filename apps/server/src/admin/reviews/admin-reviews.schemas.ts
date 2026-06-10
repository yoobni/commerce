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

export const AdminListReviewsQuerySchema = z.object({
  status: z.enum(['ALL', 'ACTIVE', 'HIDDEN', 'DELETED']).optional(),
  is_best: boolParam,
  is_photo: boolParam,
  min_rating: z
    .string()
    .optional()
    .transform((s) => (s ? parseInt(s, 10) : undefined))
    .pipe(z.number().int().min(1).max(5).optional()),
  search: z.string().max(100).optional(),
  page: intParam,
  per_page: intParam,
});

export const StatusBodySchema = z.object({
  status: z.enum(['ACTIVE', 'HIDDEN', 'DELETED']),
});

export const BestBodySchema = z.object({
  is_best: z.boolean(),
});

export const PointRewardedBodySchema = z.object({
  rewarded: z.boolean(),
});

export const UuidParamSchema = z.object({ id: z.string().uuid() });
