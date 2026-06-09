import { z } from 'zod';

export const AddCartItemBodySchema = z.object({
  option_id: z.string().uuid(),
  quantity: z.number().int().positive().max(99),
  currency: z.enum(['KRW', 'USD', 'JPY', 'EUR']),
});

export const UpdateCartItemBodySchema = z.object({
  quantity: z.number().int().positive().max(99),
});

export const CartItemIdParamSchema = z.object({
  itemId: z.string().uuid(),
});
