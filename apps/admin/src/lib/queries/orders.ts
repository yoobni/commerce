/**
 * Admin order queries. Re-exports the lib/api/orders client with the original
 * names + UI label/variant constants so existing pages keep working.
 */

import type { PaginatedResponse } from '@commerce/types';
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

// UI labels live in lib/admin-ui/orders-labels.ts (safe for client imports).
export {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_VARIANT,
} from '@/lib/admin-ui/orders-labels';

// ─── Re-exported queries ────────────────────────────────────────────────────

export async function adminListOrders(
  params: AdminListOrdersParams = {}
): Promise<PaginatedResponse<OrderRow>> {
  return apiListOrders(params);
}

export async function adminGetOrder(orderId: string): Promise<OrderDetail | null> {
  return apiGetOrder(orderId);
}
