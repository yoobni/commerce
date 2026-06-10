/**
 * Admin order queries. Re-exports the lib/api/orders client with the original
 * names + UI label/variant constants so existing pages keep working.
 */

import type { OrderStatus, PaginatedResponse } from '@commerce/types';
import {
  adminListOrders as apiListOrders,
  adminGetOrder as apiGetOrder,
  type AdminOrderRow,
  type AdminOrderDetail,
  type AdminListOrdersParams,
} from '@/lib/api/orders';

// ─── Re-exported types ──────────────────────────────────────────────────────

export type OrderRow = AdminOrderRow;
export type OrderDetail = AdminOrderDetail;
export type { AdminListOrdersParams };

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

// ─── Re-exported queries ────────────────────────────────────────────────────

export async function adminListOrders(
  params: AdminListOrdersParams = {}
): Promise<PaginatedResponse<OrderRow>> {
  return apiListOrders(params);
}

export async function adminGetOrder(orderId: string): Promise<OrderDetail | null> {
  return apiGetOrder(orderId);
}
