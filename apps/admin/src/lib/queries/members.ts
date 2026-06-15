/**
 * Admin member queries. Re-exports lib/api/members + UI labels/variants.
 */

import type { PaginatedResponse, User } from '@commerce/types';
import {
  adminListMembers as apiListMembers,
  adminGetMember as apiGetMember,
  adminGetMemberOrders as apiGetMemberOrders,
  type MemberRow as ApiMemberRow,
  type MemberOrderRow as ApiMemberOrderRow,
  type AdminListMembersParams,
} from '@/lib/api/members';

export type MemberRow = ApiMemberRow;
export type { AdminListMembersParams };

// UI labels live in lib/admin-ui/members-labels.ts (safe for client imports).
export {
  MEMBER_STATUS_LABEL,
  AUTH_PROVIDER_LABEL,
  MEMBER_STATUS_VARIANT,
  AUTH_PROVIDER_VARIANT,
} from '@/lib/admin-ui/members-labels';

// ─── Re-exported queries ────────────────────────────────────────────────────

export async function adminListMembers(
  params: AdminListMembersParams = {}
): Promise<PaginatedResponse<MemberRow>> {
  return apiListMembers(params);
}

export async function adminGetMember(memberId: string): Promise<User | null> {
  return apiGetMember(memberId);
}

export async function adminGetMemberOrders(
  userId: string,
  limit = 5
): Promise<ApiMemberOrderRow[]> {
  return apiGetMemberOrders(userId, limit);
}
