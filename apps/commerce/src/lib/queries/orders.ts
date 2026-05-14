import type { Order, OrderWithItems, PaginatedResponse } from '@commerce/types';
import { createClient } from '../supabase/server';
import { safeImageSrc } from '@/lib/images/safeSrc';

function sanitizeOrder(o: OrderWithItems): OrderWithItems {
  return {
    ...o,
    items: o.items?.map((item) => ({
      ...item,
      product_snapshot: item.product_snapshot
        ? {
            ...item.product_snapshot,
            thumbnail_url: safeImageSrc(item.product_snapshot.thumbnail_url),
          }
        : item.product_snapshot,
    })),
  } as OrderWithItems;
}

export async function listUserOrders(
  userId: string,
  { page = 1, per_page = 10 }: { page?: number; per_page?: number } = {}
): Promise<PaginatedResponse<Order>> {
  const supabase = await createClient();
  const offset = (page - 1) * per_page;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, count, error } = await (supabase.from('orders') as any)
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('ordered_at', { ascending: false })
    .range(offset, offset + per_page - 1);

  if (error) throw error;

  const total = count ?? 0;
  return {
    data: (data ?? []) as Order[],
    total,
    page,
    per_page,
    has_next: offset + per_page < total,
  };
}

export async function getOrderById(
  orderId: string,
  userId: string
): Promise<OrderWithItems | null> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('orders') as any)
    .select(
      `
      *,
      items:order_items(*)
    `
    )
    .eq('id', orderId)
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return sanitizeOrder(data as OrderWithItems);
}
