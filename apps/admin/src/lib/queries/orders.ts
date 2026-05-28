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

/**
 * 어드민 UI Badge variant 매핑. 새 Badge 색 신호(info/processing 등)에 맞춤.
 * - info: 결제됨/확정됨 (파랑) — 처리됐다는 신호
 * - processing: 진행 중 (보라) — 작업 중인 상태
 * - success: 완료 (초록)
 * - warning: 대기/요청 (앰버) — 주의 필요
 * - destructive: 환불/실패 (빨강)
 * - muted: 종결/취소 (회색)
 */
export const ORDER_STATUS_VARIANT: Record<
  OrderStatus,
  'info' | 'processing' | 'success' | 'warning' | 'destructive' | 'muted'
> = {
  PENDING_PAYMENT: 'warning',
  PAID: 'info',
  PREPARING: 'processing',
  SHIPPED: 'processing',
  DELIVERED: 'success',
  CONFIRMED: 'success',
  RETURN_REQUESTED: 'warning',
  RETURNED: 'muted',
  REFUND_REQUESTED: 'destructive',
  REFUNDED: 'muted',
  CANCELLED: 'muted',
  DELIVERY_FAILED: 'destructive',
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
  if (search) query = query.or(`order_number.ilike.%${search}%`);

  query = query.order('ordered_at', { ascending: false }).range(offset, offset + per_page - 1);

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
