/**
 * Admin member queries. Re-exports lib/api/members + UI labels/variants.
 */

import type {
  AuthProvider,
  PaginatedResponse,
  User,
  UserStatus,
} from '@commerce/types';
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

// ─── Status label & badge ─────────────────────────────────────────────────────

export const MEMBER_STATUS_LABEL: Record<UserStatus, string> = {
  ACTIVE: '활성',
  SUSPENDED: '정지',
  WITHDRAWN: '탈퇴',
};

export const AUTH_PROVIDER_LABEL: Record<AuthProvider, string> = {
  email: '이메일',
  google: 'Google',
  apple: 'Apple',
  kakao: '카카오',
  naver: '네이버',
  twitter: 'Twitter/X',
};

export const MEMBER_STATUS_VARIANT: Record<
  UserStatus,
  'success' | 'destructive' | 'muted'
> = {
  ACTIVE: 'success',
  SUSPENDED: 'destructive',
  WITHDRAWN: 'muted',
};

export const AUTH_PROVIDER_VARIANT: Record<
  AuthProvider,
  'outline' | 'secondary' | 'success' | 'warning' | 'info'
> = {
  email: 'outline',
  google: 'info',
  apple: 'secondary',
  kakao: 'warning',
  naver: 'success',
  twitter: 'info',
};

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
