import { z } from 'zod';

const intParam = z
  .string()
  .optional()
  .transform((s) => (s ? parseInt(s, 10) : undefined))
  .pipe(z.number().int().positive().optional());

export const AdminListMembersQuerySchema = z.object({
  status: z.enum(['ALL', 'ACTIVE', 'SUSPENDED', 'WITHDRAWN']).optional(),
  search: z.string().max(100).optional(),
  page: intParam,
  per_page: intParam,
});

export const MemberOrdersQuerySchema = z.object({
  limit: intParam,
});

export const UpdateStatusBodySchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'WITHDRAWN']),
});

export const UuidParamSchema = z.object({ id: z.string().uuid() });
