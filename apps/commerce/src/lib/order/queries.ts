import { createClient } from '@/lib/supabase/server';
import type { Order, OrderItem, OrderWithItems, ProductSnapshot } from '@commerce/types';

export async function getOrderById(orderId: string): Promise<OrderWithItems | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: order } = await (supabase as any)
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single();

  if (!order) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawItems } = await (supabase as any)
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);

  const items: OrderItem[] = (rawItems ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    order_id: row.order_id as string,
    product_option_id: row.product_option_id as string,
    product_snapshot: row.product_snapshot as ProductSnapshot,
    quantity: row.quantity as number,
    unit_price: Number(row.unit_price),
    total_price: Number(row.total_price),
    status: row.status as OrderItem['status'],
    created_at: row.created_at as string,
  }));

  return {
    ...(order as Order),
    subtotal: Number((order as Order).subtotal),
    shipping_fee: Number((order as Order).shipping_fee),
    discount_amount: Number((order as Order).discount_amount),
    tax_amount: Number((order as Order).tax_amount),
    total_amount: Number((order as Order).total_amount),
    items,
  };
}

export async function getUserOrders(): Promise<Order[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('ordered_at', { ascending: false });

  return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
    ...(row as unknown as Order),
    subtotal: Number(row.subtotal),
    shipping_fee: Number(row.shipping_fee),
    discount_amount: Number(row.discount_amount),
    tax_amount: Number(row.tax_amount),
    total_amount: Number(row.total_amount),
  }));
}
