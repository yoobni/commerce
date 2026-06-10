import { z } from 'zod';

const intParam = z
  .string()
  .optional()
  .transform((s) => (s ? parseInt(s, 10) : undefined))
  .pipe(z.number().int().positive().optional());

export const AdminListShippingOrdersQuerySchema = z.object({
  status: z.enum(['ALL', 'PREPARING', 'SHIPPED', 'DELIVERED']).optional(),
  search: z.string().max(100).optional(),
  page: intParam,
  per_page: intParam,
});

export const CARRIERS = [
  'CJ',
  'HANJIN',
  'LOGEN',
  'EMS',
  'DHL',
  'FEDEX',
  'UPS',
  'USPS',
  'YAMATO',
  'SAGAWA',
] as const;

export const SHIPMENT_STATUSES = [
  'PENDING',
  'PICKED_UP',
  'IN_TRANSIT',
  'CUSTOMS_HELD',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'RETURNED',
] as const;

export const StartShipmentBodySchema = z.object({
  carrier: z.enum(CARRIERS),
  tracking_number: z.string().min(1).max(80),
  country: z.string().min(1).max(80),
});

export const ShipmentStatusBodySchema = z.object({
  status: z.enum(SHIPMENT_STATUSES),
});

export const ReturnTrackingBodySchema = z.object({
  return_tracking_number: z.string().max(80),
});

export const OrderIdParamSchema = z.object({ id: z.string().uuid() });
export const ShipmentIdParamSchema = z.object({ id: z.string().uuid() });
