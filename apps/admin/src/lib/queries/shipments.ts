/**
 * Admin shipping queries. Re-exports lib/api/shipments + UI labels/variants.
 */

import type {
  Carrier,
  PaginatedResponse,
  ShipmentStatus,
} from '@commerce/types';
import {
  adminListShippingOrders as apiListShippingOrders,
  adminGetShippingOrder as apiGetShippingOrder,
  type ShippingOrderRow,
  type ShippingOrderDetail,
  type AdminShippingListParams,
} from '@/lib/api/shipments';

export type { ShippingOrderRow, ShippingOrderDetail, AdminShippingListParams };

// ─── UI labels & Badge variants (어드민 페이지 공용) ────────────────────────

export const SHIPMENT_STATUS_LABEL: Record<ShipmentStatus, string> = {
  PENDING: '대기',
  PICKED_UP: '수거 완료',
  IN_TRANSIT: '배송 중',
  CUSTOMS_HELD: '통관 보류',
  OUT_FOR_DELIVERY: '배달 중',
  DELIVERED: '배달 완료',
  RETURNED: '반송',
};

export const SHIPMENT_STATUS_VARIANT: Record<
  ShipmentStatus,
  'muted' | 'info' | 'processing' | 'warning' | 'success' | 'destructive'
> = {
  PENDING: 'muted',
  PICKED_UP: 'info',
  IN_TRANSIT: 'processing',
  CUSTOMS_HELD: 'warning',
  OUT_FOR_DELIVERY: 'processing',
  DELIVERED: 'success',
  RETURNED: 'destructive',
};

export const CARRIER_LABEL: Record<Carrier, string> = {
  CJ: 'CJ대한통운',
  HANJIN: '한진택배',
  LOGEN: '로젠택배',
  EMS: 'EMS',
  DHL: 'DHL',
  FEDEX: 'FedEx',
  UPS: 'UPS',
  USPS: 'USPS',
  YAMATO: '야마토',
  SAGAWA: '사가와',
};

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
