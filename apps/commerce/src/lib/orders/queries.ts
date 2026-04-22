import { createClient } from '@/lib/supabase/server';

// ─── Display Types ────────────────────────────────────────────────────────────

export interface OrderListItemDisplay {
  id: string;
  order_number: string;
  status: string;
  currency: string;
  total_amount: number;
  ordered_at: string;
  item_count: number;
  first_item_name: string;
  first_item_thumbnail: string;
  first_item_size: string;
  first_item_color: string;
}

export interface OrderItemDisplay {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: string;
  snapshot_name: string;
  snapshot_sku: string;
  snapshot_thumbnail_url: string;
  snapshot_size: string;
  snapshot_color: string;
  snapshot_product_id: string;
}

export interface OrderDetailDisplay {
  id: string;
  order_number: string;
  status: string;
  currency: string;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  point_used: number;
  ordered_at: string;
  // Shipping address (from snapshot)
  recipient_name: string;
  phone: string;
  postal_code: string;
  city: string;
  address_line1: string;
  address_line2: string | null;
  shipping_country: string;
  state_province: string | null;
  // Items
  items: OrderItemDisplay[];
  // Payment
  payment_method: string | null;
  payment_status: string | null;
  paid_at: string | null;
  // Shipment
  shipment_carrier: string | null;
  shipment_tracking_number: string | null;
  shipment_status: string | null;
  shipment_shipped_at: string | null;
  shipment_estimated_delivery_at: string | null;
  shipment_delivered_at: string | null;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/** Fetch order list for the authenticated user, latest first. */
export async function getOrders(): Promise<OrderListItemDisplay[]> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawOrders } = await (supabase as any)
    .from('orders')
    .select(
      `
      id,
      order_number,
      status,
      currency,
      total_amount,
      ordered_at,
      order_items ( id, product_snapshot, quantity )
    `
    )
    .eq('user_id', authData.user.id)
    .order('ordered_at', { ascending: false })
    .limit(50);

  if (!rawOrders) return [];

  return (rawOrders as Record<string, unknown>[]).map((row) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = (row.order_items as any[]) ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const snapshot = items[0] ? (items[0].product_snapshot as any) : null;

    return {
      id: row.id as string,
      order_number: row.order_number as string,
      status: row.status as string,
      currency: row.currency as string,
      total_amount: row.total_amount as number,
      ordered_at: row.ordered_at as string,
      item_count: items.length,
      first_item_name: (snapshot?.name as string) ?? '',
      first_item_thumbnail: (snapshot?.thumbnail_url as string) ?? '',
      first_item_size: (snapshot?.size as string) ?? '',
      first_item_color: (snapshot?.color as string) ?? '',
    };
  });
}

/** Fetch full order detail for the authenticated user. Returns null if not found or unauthorized. */
export async function getOrderById(orderId: string): Promise<OrderDetailDisplay | null> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: raw } = await (supabase as any)
    .from('orders')
    .select(
      `
      id,
      order_number,
      status,
      currency,
      subtotal,
      shipping_fee,
      discount_amount,
      tax_amount,
      total_amount,
      point_used,
      ordered_at,
      shipping_address_snapshot,
      order_items ( id, product_snapshot, quantity, unit_price, total_price, status ),
      payments ( method, status, paid_at, amount ),
      shipments ( carrier, tracking_number, status, shipped_at, estimated_delivery_at, delivered_at )
    `
    )
    .eq('id', orderId)
    .eq('user_id', authData.user.id)
    .single();

  if (!raw) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const order = raw as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addr = order.shipping_address_snapshot as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payment = (order.payments as any[])?.[0] ?? null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shipment = (order.shipments as any[])?.[0] ?? null;

  const items: OrderItemDisplay[] = ((order.order_items as Record<string, unknown>[]) ?? []).map(
    (item) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const snap = item.product_snapshot as any;
      return {
        id: item.id as string,
        quantity: item.quantity as number,
        unit_price: item.unit_price as number,
        total_price: item.total_price as number,
        status: item.status as string,
        snapshot_name: (snap?.name as string) ?? '',
        snapshot_sku: (snap?.sku as string) ?? '',
        snapshot_thumbnail_url: (snap?.thumbnail_url as string) ?? '',
        snapshot_size: (snap?.size as string) ?? '',
        snapshot_color: (snap?.color as string) ?? '',
        snapshot_product_id: (snap?.product_id as string) ?? '',
      };
    }
  );

  return {
    id: order.id as string,
    order_number: order.order_number as string,
    status: order.status as string,
    currency: order.currency as string,
    subtotal: order.subtotal as number,
    shipping_fee: order.shipping_fee as number,
    discount_amount: order.discount_amount as number,
    tax_amount: order.tax_amount as number,
    total_amount: order.total_amount as number,
    point_used: order.point_used as number,
    ordered_at: order.ordered_at as string,
    recipient_name: (addr?.recipient_name as string) ?? '',
    phone: (addr?.phone as string) ?? '',
    postal_code: (addr?.postal_code as string) ?? '',
    city: (addr?.city as string) ?? '',
    address_line1: (addr?.address_line1 as string) ?? '',
    address_line2: (addr?.address_line2 as string | null) ?? null,
    shipping_country: (addr?.country as string) ?? '',
    state_province: (addr?.state_province as string | null) ?? null,
    items,
    payment_method: (payment?.method as string) ?? null,
    payment_status: (payment?.status as string) ?? null,
    paid_at: (payment?.paid_at as string) ?? null,
    shipment_carrier: (shipment?.carrier as string) ?? null,
    shipment_tracking_number: (shipment?.tracking_number as string) ?? null,
    shipment_status: (shipment?.status as string) ?? null,
    shipment_shipped_at: (shipment?.shipped_at as string) ?? null,
    shipment_estimated_delivery_at: (shipment?.estimated_delivery_at as string) ?? null,
    shipment_delivered_at: (shipment?.delivered_at as string) ?? null,
  };
}
