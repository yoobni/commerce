import { z } from 'zod';

export const IssuanceIdParamSchema = z.object({
  issuanceId: z.string().uuid(),
});

export const MarkUsedBodySchema = z.object({
  order_id: z.string().uuid().optional(),
});
