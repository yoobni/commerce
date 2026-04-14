/**
 * Admin member queries — uses service-role client (bypasses RLS).
 */

import type {
  User,
  UserStatus,
  Order,
  OrderItem,
  Point,
  PointTransaction,
  PaginatedResponse,
  UUID,
} from '@commerce/types';
import { createServiceClient } from '@/lib/supabase/service';

// ─── Sanction types (not in shared package yet) ───────────────────────────────

export type SanctionType = 'WARNING' | 'SUSPEND_7D' | 'SUSPEND_30D' | 'PERMANENT_BAN';

export interface Sanction {
  id: UUID;
  user_id: UUID;
  type: SanctionType;
  reason: string;
  report_id: UUID | null;
  starts_at: string;
  ends_at: string | null;
  is_active: boolean;
  created_by: UUID;
  created_at: string;
}

// ─── List ─────────────────────────────────────────────────────────────────────

export interface AdminMemberListParams {
  status?: UserStatus | 'ALL';
  search?: string;
  page?: number;
  per_page?: number;
}

export async function adminListMembers(
  params: AdminMemberListParams = {}
): Promise<PaginatedResponse<User>> {
  const { status = 'ALL', search, page = 1, per_page = 20 } = params;
  const supabase = createServiceClient();
  const offset = (page - 1) * per_page;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from('users') as any).select('*', { count: 'exact' });

  if (status !== 'ALL') query = query.eq('status', status);
  if (search) {
    query = query.or(
      `name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
    );
  }

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + per_page - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  const total = count ?? 0;
  return {
    data: (data ?? []) as User[],
    total,
    page,
    per_page,
    has_next: offset + per_page < total,
  };
}

// ─── Detail ───────────────────────────────────────────────────────────────────

export async function adminGetMember(id: string): Promise<User | null> {
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('users') as any)
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as User;
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export type AdminMemberOrderRow = Order & {
  items: OrderItem[];
};

export async function adminGetMemberOrders(userId: string): Promise<AdminMemberOrderRow[]> {
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('orders') as any)
    .select('*, items:order_items(*)')
    .eq('user_id', userId)
    .order('ordered_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data ?? []) as AdminMemberOrderRow[];
}

// ─── Points ───────────────────────────────────────────────────────────────────

export async function adminGetMemberPoint(userId: string): Promise<Point | null> {
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('points') as any)
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return data as Point;
}

export async function adminGetMemberPointTransactions(
  userId: string
): Promise<PointTransaction[]> {
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('point_transactions') as any)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data ?? []) as PointTransaction[];
}

// ─── Sanctions ────────────────────────────────────────────────────────────────

export async function adminGetMemberSanctions(userId: string): Promise<Sanction[]> {
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('sanctions') as any)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Sanction[];
}
