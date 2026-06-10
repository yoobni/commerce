// Admin shipping API client. Server-side only.

import type {
  Carrier,
  Order,
  OrderItem,
  PaginatedResponse,
  Shipment,
  ShipmentStatus,
  User,
} from '@commerce/types';
import { apiGetList, apiGetOne, apiPatch, apiPost } from './client';
import { getAdminToken } from './auth';

export interface ShippingOrderRow extends Order {
  user: Pick<User, 'id' | 'name' | 'email'> | null;
  shipment: Shipment | null;
}

export interface ShippingOrderDetail extends Order {
  items: OrderItem[];
  user: Pick<User, 'id' | 'name' | 'email' | 'phone'> | null;
  shipment: Shipment | null;
}

export interface AdminShippingListParams {
  status?: 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'ALL';
  search?: string;
  page?: number;
  per_page?: number;
}

function buildQuery(params: AdminShippingListParams): string {
  const sp = new URLSearchParams();
  if (params.status && params.status !== 'ALL') sp.set('status', params.status);
  if (params.search) sp.set('search', params.search);
  if (params.page) sp.set('page', String(params.page));
  if (params.per_page) sp.set('per_page', String(params.per_page));
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

async function authed() {
  const accessToken = await getAdminToken();
  return { accessToken, noStore: true } as const;
}

export async function adminListShippingOrders(
  params: AdminShippingListParams = {}
): Promise<PaginatedResponse<ShippingOrderRow>> {
  const { data, meta } = await apiGetList<ShippingOrderRow>(
    `/admin/shipping/orders${buildQuery(params)}`,
    await authed()
  );
  return {
    data,
    total: meta.total,
    page: meta.page,
    per_page: meta.per_page,
    has_next: meta.has_next,
  };
}

export async function adminGetShippingOrder(id: string): Promise<ShippingOrderDetail | null> {
  try {
    return await apiGetOne<ShippingOrderDetail>(
      `/admin/shipping/orders/${id}`,
      await authed()
    );
  } catch (e) {
    if ((e as { status?: number }).status === 404) return null;
    throw e;
  }
}

export async function adminStartShipment(
  orderId: string,
  carrier: Carrier,
  trackingNumber: string,
  country: string
): Promise<void> {
  await apiPost(`/admin/shipping/orders/${orderId}/start`, {
    ...(await authed()),
    body: { carrier, tracking_number: trackingNumber, country },
  });
}

export async function adminUpdateShipmentStatus(
  shipmentId: string,
  status: ShipmentStatus
): Promise<void> {
  await apiPatch(`/admin/shipping/shipments/${shipmentId}/status`, {
    ...(await authed()),
    body: { status },
  });
}

export async function adminSetReturnTracking(
  shipmentId: string,
  returnTrackingNumber: string
): Promise<void> {
  await apiPatch(`/admin/shipping/shipments/${shipmentId}/return-tracking`, {
    ...(await authed()),
    body: { return_tracking_number: returnTrackingNumber },
  });
}
