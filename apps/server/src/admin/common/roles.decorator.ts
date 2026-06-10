import { SetMetadata } from '@nestjs/common';
import type { AdminRole } from './admin-roles';

export const ADMIN_ROLES_KEY = 'admin_required_role';

// Per-route role gate. Used with AdminAuthGuard; without this decorator any
// active admin (OPERATOR or higher) passes. With it, the live admins.role
// must satisfy the rank check.
export const Roles = (role: AdminRole) => SetMetadata(ADMIN_ROLES_KEY, role);
