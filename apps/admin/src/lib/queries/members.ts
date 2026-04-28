/**
 * Admin member (user) queries — uses service-role client (bypasses RLS).
 */

import type { User, UserStatus, AuthProvider, PaginatedResponse } from '@commerce/types';
import { createServiceClient } from '@/lib/supabase/service';

// ─── Extended types ───────────────────────────────────────────────────────────

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

// ─── Status label & badge ─────────────────────────────────────────────────────

export const MEMBER_STATUS_LABEL: Record<UserStatus, string> = {
  ACTIVE: '활성',
  SUSPENDED: '정지',
  WITHDRAWN: '탈퇴',
};

export const MEMBER_STATUS_BADGE: Record<UserStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  SUSPENDED: 'bg-red-100 text-red-700',
  WITHDRAWN: 'bg-gray-100 text-gray-500',
};

export const AUTH_PROVIDER_LABEL: Record<AuthProvider, string> = {
  email: '이메일',
  google: 'Google',
  apple: 'Apple',
  kakao: '카카오',
  naver: '네이버',
  twitter: 'Twitter/X',
};

export const AUTH_PROVIDER_BADGE: Record<AuthProvider, string> = {
  email: 'bg-gray-100 text-gray-600',
  google: 'bg-blue-50 text-blue-600',
  apple: 'bg-gray-900 text-white',
  kakao: 'bg-yellow-100 text-yellow-800',
  naver: 'bg-green-100 text-green-700',
  twitter: 'bg-sky-100 text-sky-700',
};

// ─── Params ───────────────────────────────────────────────────────────────────

export interface AdminMemberListParams {
  status?: UserStatus | 'ALL';
  search?: string;
  page?: number;
  per_page?: number;
}

// ─── Member list ──────────────────────────────────────────────────────────────

export async function adminListMembers(
  params: AdminMemberListParams = {}
): Promise<PaginatedResponse<MemberRow>> {
  const { status = 'ALL', search, page = 1, per_page = 20 } = params;
  const supabase = createServiceClient();
  const offset = (page - 1) * per_page;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from('users') as any).select(
    'id, email, name, provider, country, status, last_login_at, created_at',
    { count: 'exact' }
  );

  if (status !== 'ALL') query = query.eq('status', status);
  if (search) query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);

  query = query.order('created_at', { ascending: false }).range(offset, offset + per_page - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    data: (data ?? []) as MemberRow[],
    total: count ?? 0,
    page,
    per_page,
    has_next: offset + per_page < (count ?? 0),
  };
}

// ─── Member detail ────────────────────────────────────────────────────────────

export async function adminGetMember(memberId: string): Promise<User | null> {
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('users') as any)
    .select('*')
    .eq('id', memberId)
    .single();

  if (error || !data) return null;
  return data as User;
}

// ─── Member order history ─────────────────────────────────────────────────────

export async function adminGetMemberOrders(
  userId: string,
  limit = 5
): Promise<
  Array<{
    id: string;
    order_number: string;
    total_amount: number;
    status: string;
    ordered_at: string;
  }>
> {
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('orders') as any)
    .select('id, order_number, total_amount, status, ordered_at')
    .eq('user_id', userId)
    .order('ordered_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return data ?? [];
}
