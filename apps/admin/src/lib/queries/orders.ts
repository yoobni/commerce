/**
 * Admin order queries — uses service-role client (bypasses RLS).
 */

import type {
  Order,
  OrderItem,
  OrderStatus,
  Payment,
  User,
  PaginatedResponse,
} from '@commerce/types';
import { createServiceClient } from '@/lib/supabase/service';

// ─── Extended types ───────────────────────────────────────────────────────────

export interface OrderRow {
  id: string;
  order_number: string;
  user: Pick<User, 'id' | 'name' | 'email'> | null;
  currency: string;
  total_amount: number;
  status: OrderStatus;
  ordered_at: string;
}

export interface OrderDetail extends Order {
  user: Pick<User, 'id' | 'name' | 'email' | 'phone'> | null;
  items: OrderItem[];
  payment: Payment | null;
}

// ─── Status label & badge ─────────────────────────────────────────────────────

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: '결제대기',
  PAID: '결제완료',
  PREPARING: '준비중',
  SHIPPED: '배송중',
  DELIVERED: '배송완료',
  CONFIRMED: '구매확정',
  RETURN_REQUESTED: '반품요청',
  RETURNED: '반품완료',
  REFUND_REQUESTED: '환불요청',
  REFUNDED: '환불완료',
  CANCELLED: '취소',
  DELIVERY_FAILED: '배송실패',
};

export const ORDER_STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-indigo-100 text-indigo-700',
  SHIPPED: 'bg-violet-100 text-violet-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CONFIRMED: 'bg-emerald-100 text-emerald-700',
  RETURN_REQUESTED: 'bg-orange-100 text-orange-700',
  RETURNED: 'bg-amber-100 text-amber-700',
  REFUND_REQUESTED: 'bg-red-100 text-red-600',
  REFUNDED: 'bg-gray-100 text-gray-500',
  CANCELLED: 'bg-gray-100 text-gray-500',
  DELIVERY_FAILED: 'bg-red-100 text-red-700',
};

// ─── Params ───────────────────────────────────────────────────────────────────

export interface AdminOrderListParams {
  status?: OrderStatus | 'ALL';
  search?: string;
  page?: number;
  per_page?: number;
}

// ─── Order list ───────────────────────────────────────────────────────────────

export async function adminListOrders(
  params: AdminOrderListParams = {}
): Promise<PaginatedResponse<OrderRow>> {
  const { status = 'ALL', search, page = 1, per_page = 20 } = params;
  const supabase = createServiceClient();
  const offset = (page - 1) * per_page;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from('orders') as any).select(
    'id, order_number, currency, total_amount, status, ordered_at, user:users!user_id(id, name, email)',
    { count: 'exact' }
  );

  if (status !== 'ALL') query = query.eq('status', status);
  if (search)
    query = query.or(
      `order_number.ilike.%${search}%`
    );

  query = query
    .order('ordered_at', { ascending: false })
    .range(offset, offset + per_page - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    data: (data ?? []) as OrderRow[],
    total: count ?? 0,
    page,
    per_page,
    has_next: offset + per_page < (count ?? 0),
  };
}

// ─── Order detail ─────────────────────────────────────────────────────────────

export async function adminGetOrder(orderId: string): Promise<OrderDetail | null> {
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('orders') as any)
    .select(
      `*,
      user:users!user_id(id, name, email, phone),
      items:order_items(*),
      payment:payments!order_id(*)`
    )
    .eq('id', orderId)
    .single();

  if (error || !data) return null;
  return data as OrderDetail;
}
