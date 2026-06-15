/**
 * Admin shipping queries. Re-exports lib/api/shipments + UI labels/variants.
 */

import type { PaginatedResponse } from '@commerce/types';
import {
  adminListShippingOrders as apiListShippingOrders,
  adminGetShippingOrder as apiGetShippingOrder,
  type ShippingOrderRow,
  type ShippingOrderDetail,
  type AdminShippingListParams,
} from '@/lib/api/shipments';

export type { ShippingOrderRow, ShippingOrderDetail, AdminShippingListParams };

// UI labels live in lib/admin-ui/shipments-labels.ts (safe for client imports).
export {
  SHIPMENT_STATUS_LABEL,
  SHIPMENT_STATUS_VARIANT,
  CARRIER_LABEL,
} from '@/lib/admin-ui/shipments-labels';

// ─── Re-exported queries ────────────────────────────────────────────────────

export async function adminListShippingOrders(
  params: AdminShippingListParams = {}
): Promise<PaginatedResponse<ShippingOrderRow>> {
  return apiListShippingOrders(params);
}

export async function adminGetShippingOrder(
  orderId: string
): Promise<ShippingOrderDetail | null> {
  return apiGetShippingOrder(orderId);
}
