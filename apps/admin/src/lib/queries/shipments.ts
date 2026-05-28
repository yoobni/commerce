/**
 * Admin shipping queries — uses service-role client (bypasses RLS).
 */

import type {
  Order,
  OrderItem,
  Shipment,
  ShipmentStatus,
  Carrier,
  User,
  PaginatedResponse,
  OrderStatus,
} from '@commerce/types';
import { createServiceClient } from '@/lib/supabase/service';

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

// ─── Extended types ───────────────────────────────────────────────────────────

export interface ShippingOrderRow extends Order {
  user: Pick<User, 'id' | 'name' | 'email'> | null;
  shipment: Shipment | null;
}

export interface ShippingOrderDetail extends Order {
  items: OrderItem[];
  user: Pick<User, 'id' | 'name' | 'email' | 'phone'> | null;
  shipment: Shipment | null;
}

// ─── List ─────────────────────────────────────────────────────────────────────

export interface AdminShippingListParams {
  status?: 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'ALL';
  search?: string; // order_number
  page?: number;
  per_page?: number;
}

const SHIPPING_STATUSES: OrderStatus[] = ['PREPARING', 'SHIPPED', 'DELIVERED'];

export async function adminListShippingOrders(
  params: AdminShippingListParams = {}
): Promise<PaginatedResponse<ShippingOrderRow>> {
  const { status = 'ALL', search, page = 1, per_page = 20 } = params;
  const supabase = createServiceClient();
  const offset = (page - 1) * per_page;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from('orders') as any).select(
    '*, user:users!user_id(id, name, email), shipment:shipments(*)',
    { count: 'exact' }
  );

  if (status !== 'ALL') {
    query = query.eq('status', status);
  } else {
    query = query.in('status', SHIPPING_STATUSES);
  }

  if (search) {
    query = query.ilike('order_number', `%${search}%`);
  }

  query = query.order('ordered_at', { ascending: false }).range(offset, offset + per_page - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  const total = count ?? 0;
  const rows = ((data ?? []) as ShippingOrderRow[]).map((row) => ({
    ...row,
    shipment: Array.isArray(row.shipment) ? (row.shipment[0] ?? null) : row.shipment,
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

export async function adminGetShippingOrder(orderId: string): Promise<ShippingOrderDetail | null> {
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('orders') as any)
    .select(
      `*,
      items:order_items(*),
      user:users!user_id(id, name, email, phone),
      shipment:shipments(*)`
    )
    .eq('id', orderId)
    .single();

  if (error || !data) return null;

  const row = data as ShippingOrderDetail & { shipment: Shipment | Shipment[] | null };
  return {
    ...row,
    shipment: Array.isArray(row.shipment) ? (row.shipment[0] ?? null) : row.shipment,
  };
}
