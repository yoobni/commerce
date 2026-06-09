import { z } from 'zod';

export const ProductIdParamSchema = z.object({
  productId: z.string().uuid(),
});

export const ToggleBodySchema = z.object({
  product_id: z.string().uuid(),
});
