// Admin role hierarchy — mirrors apps/admin/src/lib/auth/roles.ts so the
// signed session payload stays compatible across both sides of the boundary.

export type AdminRole = 'SUPER_ADMIN' | 'OPERATOR';

export const ROLE_RANK: Record<AdminRole, number> = {
  OPERATOR: 1,
  SUPER_ADMIN: 2,
};

export function hasPermission(userRole: string, minRole: AdminRole): boolean {
  const userRank = ROLE_RANK[userRole as AdminRole] ?? 0;
  return userRank >= ROLE_RANK[minRole];
}
