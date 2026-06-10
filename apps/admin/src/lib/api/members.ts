// Admin members API client. Server-side only.

import type { AuthProvider, PaginatedResponse, User, UserStatus } from '@commerce/types';
import { apiGetList, apiGetOne, apiPatch } from './client';
import { getAdminToken } from './auth';

export interface MemberRow {
  id: string;
  email: string;
  name: string;
  provider: AuthProvider;
  country: string;
  status: UserStatus;
  last_login_at: string | null;
  created_at: string;
}

export interface MemberOrderRow {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  ordered_at: string;
}

export interface AdminListMembersParams {
  status?: UserStatus | 'ALL';
  search?: string;
  page?: number;
  per_page?: number;
}

function buildQuery(params: AdminListMembersParams): string {
  const sp = new URLSearchParams();
  if (params.status && params.status !== 'ALL') sp.set('status', params.status);
  if (params.search) sp.set('search', params.search);
  if (params.page) sp.set('page', String(params.page));
  if (params.per_page) sp.set('per_page', String(params.per_page));
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

async function authed() {
  const accessToken = await getAdminToken();
  return { accessToken, noStore: true } as const;
}

export async function adminListMembers(
  params: AdminListMembersParams = {}
): Promise<PaginatedResponse<MemberRow>> {
  const { data, meta } = await apiGetList<MemberRow>(
    `/admin/members${buildQuery(params)}`,
    await authed()
  );
  return {
    data,
    total: meta.total,
    page: meta.page,
    per_page: meta.per_page,
    has_next: meta.has_next,
  };
}

export async function adminGetMember(id: string): Promise<User | null> {
  try {
    return await apiGetOne<User>(`/admin/members/${id}`, await authed());
  } catch (e) {
    if ((e as { status?: number }).status === 404) return null;
    throw e;
  }
}

export async function adminGetMemberOrders(
  userId: string,
  limit = 5
): Promise<MemberOrderRow[]> {
  return apiGetOne<MemberOrderRow[]>(
    `/admin/members/${userId}/orders?limit=${limit}`,
    await authed()
  );
}

export async function adminUpdateMemberStatus(
  id: string,
  status: UserStatus
): Promise<void> {
  await apiPatch(`/admin/members/${id}/status`, { ...(await authed()), body: { status } });
}
