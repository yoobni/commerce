/**
 * Admin shipping queries — uses service-role client (bypasses RLS).
 */

import type {
  Order,
  OrderItem,
  Shipment,
  User,
  PaginatedResponse,
  OrderStatus,
} from '@commerce/types';
import { createServiceClient } from '@/lib/supabase/service';

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
