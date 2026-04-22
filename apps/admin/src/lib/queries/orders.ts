/**
 * Admin order queries — uses service-role client (bypasses RLS).
 */

import type {
  Order,
  OrderItem,
  Payment,
  Shipment,
  User,
  PaginatedResponse,
  OrderStatus,
} from '@commerce/types';
import { createServiceClient } from '@/lib/supabase/service';

// ─── Extended types ───────────────────────────────────────────────────────────

export interface AdminOrderRow extends Order {
  user: Pick<User, 'id' | 'name' | 'email'> | null;
  payment: Pick<Payment, 'method' | 'status' | 'amount'> | null;
}

export interface AdminOrderDetail extends Order {
  items: OrderItem[];
  user: Pick<User, 'id' | 'name' | 'email' | 'phone'> | null;
  payment: Payment | Payment[] | null;
  shipment: Shipment | Shipment[] | null;
}

// ─── List ─────────────────────────────────────────────────────────────────────

export interface AdminOrderListParams {
  status?: OrderStatus | 'ALL';
  search?: string; // order_number
  page?: number;
  per_page?: number;
}

export async function adminListOrders(
  params: AdminOrderListParams = {}
): Promise<PaginatedResponse<AdminOrderRow>> {
  const { status = 'ALL', search, page = 1, per_page = 20 } = params;
  const supabase = createServiceClient();
  const offset = (page - 1) * per_page;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from('orders') as any).select(
    '*, user:users!user_id(id, name, email), payment:payments(method, status, amount)',
    { count: 'exact' }
  );

  if (status !== 'ALL') query = query.eq('status', status);
  if (search) {
    query = query.ilike('order_number', `%${search}%`);
  }

  query = query
    .order('ordered_at', { ascending: false })
    .range(offset, offset + per_page - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  const total = count ?? 0;

  // Normalize payment (may be array due to incoming FK)
  const rows = ((data ?? []) as AdminOrderRow[]).map((row) => ({
    ...row,
    payment: Array.isArray(row.payment)
      ? (row.payment[0] ?? null)
      : row.payment,
  }));

  return {
    data: rows,
    total,
    page,
    per_page,
    has_next: offset + per_page < total,
  };
}

// ─── Detail ───────────────────────────────────────────────────────────────────

export async function adminGetOrder(id: string): Promise<AdminOrderDetail | null> {
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('orders') as any)
    .select(
      `*,
      items:order_items(*),
      user:users!user_id(id, name, email, phone),
      payment:payments(*),
      shipment:shipments(*)`
    )
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as AdminOrderDetail;
}
