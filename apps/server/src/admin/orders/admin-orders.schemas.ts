import { z } from 'zod';

const intParam = z
  .string()
  .optional()
  .transform((s) => (s ? parseInt(s, 10) : undefined))
  .pipe(z.number().int().positive().optional());

export const ORDER_STATUSES = [
  'PENDING_PAYMENT',
  'PAID',
  'PREPARING',
  'SHIPPED',
  'DELIVERED',
  'CONFIRMED',
  'RETURN_REQUESTED',
  'RETURNED',
  'REFUND_REQUESTED',
  'REFUNDED',
  'CANCELLED',
  'DELIVERY_FAILED',
] as const;

export const AdminListOrdersQuerySchema = z.object({
  status: z.enum(['ALL', ...ORDER_STATUSES]).optional(),
  search: z.string().max(100).optional(),
  page: intParam,
  per_page: intParam,
});

export const UpdateStatusBodySchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export const RefundBodySchema = z.object({
  amount: z.number().int().positive(),
});

export const MemoBodySchema = z.object({
  memo: z.string().max(2000),
});

export const UuidParamSchema = z.object({ id: z.string().uuid() });
