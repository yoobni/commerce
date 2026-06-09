import { z } from 'zod';

export const CreateIntentBodySchema = z.object({
  amount: z.number().int().positive(),
  currency: z.string().min(2).max(8),
  metadata: z.record(z.string(), z.string()).optional(),
});

export const CaptureBodySchema = z.object({
  payment_intent_id: z.string().min(1).max(200),
  order_id: z.string().uuid(),
  method: z.string().min(1).max(40),
  amount: z.number().int().positive(),
  currency: z.string().min(2).max(8),
});
