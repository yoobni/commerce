import { z } from 'zod';

const intParam = z
  .string()
  .optional()
  .transform((s) => (s ? parseInt(s, 10) : undefined))
  .pipe(z.number().int().positive().optional());

export const AdminListCouponsQuerySchema = z.object({
  status: z.enum(['ALL', 'ACTIVE', 'PAUSED', 'EXPIRED', 'DEPLETED']).optional(),
  search: z.string().max(100).optional(),
  page: intParam,
  per_page: intParam,
});

export const IssuanceListQuerySchema = z.object({
  page: intParam,
  per_page: intParam,
});

export const SaveCouponBodySchema = z.object({
  code: z.string().min(1).max(80),
  name_ko: z.string().min(1).max(200),
  name_en: z.string().min(1).max(200),
  name_ja: z.string().min(1).max(200),
  name_de: z.string().min(1).max(200),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  discount_value: z.number().int().min(0),
  max_discount_amount: z.number().int().min(0).nullable(),
  min_order_amount: z.number().int().min(0).nullable(),
  currency: z.enum(['KRW', 'USD', 'JPY', 'EUR']).nullable(),
  max_issuance_count: z.number().int().min(0).nullable(),
  max_use_per_user: z.number().int().min(1),
  is_combinable: z.boolean(),
  starts_at: z.string(),
  expires_at: z.string(),
});

export const UpdateCouponStatusBodySchema = z.object({
  status: z.enum(['ACTIVE', 'PAUSED', 'EXPIRED', 'DEPLETED']),
});

export const IssueCouponBodySchema = z.object({
  email: z.string().email().max(200),
});

export const CouponIdParamSchema = z.object({ id: z.string().uuid() });
export const IssuanceParamsSchema = z.object({
  id: z.string().uuid(),
  issuanceId: z.string().uuid(),
});
