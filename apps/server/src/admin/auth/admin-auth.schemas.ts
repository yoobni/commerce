import { z } from 'zod';

export const LoginBodySchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(200),
});

export type LoginBody = z.infer<typeof LoginBodySchema>;
