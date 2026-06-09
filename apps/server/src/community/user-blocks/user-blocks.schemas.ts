import { z } from 'zod';

export const BlockBodySchema = z.object({
  target_user_id: z.string().uuid(),
});

export const TargetUserIdParamSchema = z.object({
  targetUserId: z.string().uuid(),
});
