import { z } from 'zod';

const intParam = z
  .string()
  .optional()
  .transform((s) => (s ? parseInt(s, 10) : undefined))
  .pipe(z.number().int().positive().optional());

export const ListOrdersQuerySchema = z.object({
  page: intParam,
  per_page: intParam,
});

export const OrderIdParamSchema = z.object({
  id: z.string().uuid(),
});

const ItemSnapshotSchema = z.object({
  product_id: z.string().uuid(),
  product_option_id: z.string().uuid(),
  name: z.string(),
  sku: z.string(),
  thumbnail_url: z.string(),
  size: z.string(),
  color: z.string(),
});

const ItemSchema = z.object({
  product_option_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  unit_price: z.number().int().nonnegative(),
  total_price: z.number().int().nonnegative(),
  snapshot: ItemSnapshotSchema,
});

const ShippingSchema = z.object({
  address_id: z.string().uuid().nullable(),
  recipient_name: z.string().min(1).max(80),
  phone: z.string().min(1).max(40),
  postal_code: z.string().min(1).max(20),
  address_line1: z.string().min(1).max(200),
  address_line2: z.string().max(200).nullable().optional(),
  delivery_memo: z.string().max(200).nullable().optional(),
});

export const CreateOrderBodySchema = z.object({
  cart_id: z.string().uuid(),
  shipping: ShippingSchema,
  items: z.array(ItemSchema).min(1),
  coupon_issuance_id: z.string().uuid().nullable().optional(),
  point_used: z.number().int().nonnegative().optional(),
  currency: z.enum(['KRW', 'USD', 'JPY', 'EUR']),
  subtotal: z.number().int().nonnegative(),
  shipping_fee: z.number().int().nonnegative(),
  discount_amount: z.number().int().nonnegative(),
  tax_amount: z.number().int().nonnegative(),
  total_amount: z.number().int().nonnegative(),
});
