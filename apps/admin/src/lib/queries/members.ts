/**
 * Admin member queries — uses service-role client (bypasses RLS).
 */

import type { User, UserStatus, Order, PaginatedResponse } from '@commerce/types';
import { createServiceClient } from '@/lib/supabase/service';

// ─── Status labels ────────────────────────────────────────────────────────────

export const USER_STATUS_LABEL: Record<UserStatus, string> = {
  ACTIVE: '정상',
  SUSPENDED: '정지',
  WITHDRAWN: '탈퇴',
};

export const USER_STATUS_BADGE: Record<UserStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  SUSPENDED: 'bg-red-100 text-red-700',
  WITHDRAWN: 'bg-gray-100 text-gray-500',
};

// ─── Extended types ───────────────────────────────────────────────────────────

export interface MemberRow extends User {
  order_count: number;
}

export interface MemberDetail extends User {
  recent_orders: Pick<Order, 'id' | 'order_number' | 'status' | 'total_amount' | 'currency' | 'ordered_at'>[];
  order_count: number;
  total_spent: number;
}

// ─── List ─────────────────────────────────────────────────────────────────────

export type MemberStatusFilter = UserStatus | 'ALL';

export interface AdminMemberListParams {
  status?: MemberStatusFilter;
  search?: string;
  page?: number;
  per_page?: number;
}

export async function adminListMembers(
  params: AdminMemberListParams = {}
): Promise<PaginatedResponse<MemberRow>> {
  const { status = 'ALL', search, page = 1, per_page = 20 } = params;
  const supabase = createServiceClient();
  const offset = (page - 1) * per_page;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from('users') as any).select('*', { count: 'exact' });

  if (status !== 'ALL') {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + per_page - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  const total = count ?? 0;
  const rows = ((data ?? []) as User[]).map((u) => ({
    ...u,
    order_count: 0,
  }));

  return { data: rows, total, page, per_page, has_next: offset + per_page < total };
}

// ─── Detail ───────────────────────────────────────────────────────────────────

export async function adminGetMember(userId: string): Promise<MemberDetail | null> {
  const supabase = createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: user, error: userError } = await (supabase.from('users') as any)
    .select('*')
    .eq('id', userId)
    .single();

  if (userError || !user) return null;

  // Recent orders
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orders, error: ordersError } = await (supabase.from('orders') as any)
    .select('id, order_number, status, total_amount, currency, ordered_at')
    .eq('user_id', userId)
    .order('ordered_at', { ascending: false })
    .limit(10);

  if (ordersError) throw ordersError;

  const recentOrders = (orders ?? []) as MemberDetail['recent_orders'];

  const orderCount = recentOrders.length;
  const totalSpent = recentOrders.reduce((sum, o) => sum + o.total_amount, 0);

  return {
    ...(user as User),
    recent_orders: recentOrders,
    order_count: orderCount,
    total_spent: totalSpent,
  };
}
