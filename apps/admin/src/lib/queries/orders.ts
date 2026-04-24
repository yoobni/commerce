/**
 * Admin order queries — uses service-role client (bypasses RLS).
 */

import type {
  Order,
  OrderItem,
  OrderStatus,
  User,
  PaginatedResponse,
} from '@commerce/types';
import { createServiceClient } from '@/lib/supabase/service';

// ─── Extended types ───────────────────────────────────────────────────────────

export interface OrderRow extends Order {
  user: Pick<User, 'id' | 'name' | 'email'> | null;
  item_count: number;
}

export interface OrderDetail extends Order {
  user: Pick<User, 'id' | 'name' | 'email' | 'phone'> | null;
  items: OrderItem[];
}

// ─── Status labels ────────────────────────────────────────────────────────────

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: '결제 대기',
  PAID: '결제 완료',
  PREPARING: '배송 준비',
  SHIPPED: '배송 중',
  DELIVERED: '배달 완료',
  CONFIRMED: '구매 확정',
  RETURN_REQUESTED: '반품 요청',
  RETURNED: '반품 완료',
  REFUND_REQUESTED: '환불 요청',
  REFUNDED: '환불 완료',
  CANCELLED: '취소',
  DELIVERY_FAILED: '배달 실패',
};

export const ORDER_STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-indigo-100 text-indigo-700',
  SHIPPED: 'bg-violet-100 text-violet-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CONFIRMED: 'bg-emerald-100 text-emerald-700',
  RETURN_REQUESTED: 'bg-orange-100 text-orange-700',
  RETURNED: 'bg-orange-100 text-orange-700',
  REFUND_REQUESTED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
  DELIVERY_FAILED: 'bg-red-100 text-red-700',
};

// ─── Admin-allowed status transitions ─────────────────────────────────────────

export const ORDER_STATUS_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING_PAYMENT: ['PAID', 'CANCELLED'],
  PAID: ['PREPARING', 'CANCELLED'],
  PREPARING: ['CANCELLED'],
  DELIVERED: ['CONFIRMED', 'RETURN_REQUESTED'],
  RETURN_REQUESTED: ['RETURNED', 'PREPARING'],
  RETURNED: ['REFUND_REQUESTED'],
  REFUND_REQUESTED: ['REFUNDED'],
  DELIVERY_FAILED: ['RETURN_REQUESTED'],
};

// ─── List ─────────────────────────────────────────────────────────────────────

export type OrderStatusFilter = OrderStatus | 'ALL';

export interface AdminOrderListParams {
  status?: OrderStatusFilter;
  search?: string; // order_number or user name/email
  page?: number;
  per_page?: number;
}

export async function adminListOrders(
  params: AdminOrderListParams = {}
): Promise<PaginatedResponse<OrderRow>> {
  const { status = 'ALL', search, page = 1, per_page = 20 } = params;
  const supabase = createServiceClient();
  const offset = (page - 1) * per_page;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from('orders') as any).select(
    '*, user:users!user_id(id, name, email)',
    { count: 'exact' }
  );

  if (status !== 'ALL') {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(`order_number.ilike.%${search}%`);
  }

  query = query
    .order('ordered_at', { ascending: false })
    .range(offset, offset + per_page - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  const total = count ?? 0;
  const rows = ((data ?? []) as (Order & { user: Pick<User, 'id' | 'name' | 'email'> | null })[]).map(
    (row) => ({
      ...row,
      item_count: 0, // item count loaded separately if needed
    })
  );

  return { data: rows, total, page, per_page, has_next: offset + per_page < total };
}

// ─── Detail ───────────────────────────────────────────────────────────────────

export async function adminGetOrder(orderId: string): Promise<OrderDetail | null> {
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('orders') as any)
    .select(
      `*,
      user:users!user_id(id, name, email, phone),
      items:order_items(*)`
    )
    .eq('id', orderId)
    .single();

  if (error || !data) return null;
  return data as OrderDetail;
}
