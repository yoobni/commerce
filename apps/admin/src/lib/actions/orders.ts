'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/service';
import { getSession } from '@/lib/auth/session';
import type { OrderStatus } from '@commerce/types';

// ─── Valid order status transitions ───────────────────────────────────────────

const ORDER_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING_PAYMENT: ['CANCELLED'],
  PAID: ['PREPARING', 'CANCELLED'],
  PREPARING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['CONFIRMED', 'RETURN_REQUESTED'],
  CONFIRMED: [],
  RETURN_REQUESTED: ['RETURNED', 'PREPARING'],
  RETURNED: ['REFUND_REQUESTED'],
  REFUND_REQUESTED: ['REFUNDED'],
  REFUNDED: [],
  CANCELLED: [],
  DELIVERY_FAILED: ['RETURN_REQUESTED', 'CANCELLED'],
};

// ─── Update order status ──────────────────────────────────────────────────────

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: current, error: fetchError } = await (supabase.from('orders') as any)
    .select('status')
    .eq('id', orderId)
    .single();

  if (fetchError || !current) throw new Error('주문을 찾을 수 없습니다.');

  const allowed = ORDER_TRANSITIONS[current.status as OrderStatus] ?? [];
  if (!allowed.includes(newStatus)) {
    throw new Error(`상태 전이 불가: ${current.status} → ${newStatus}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('orders') as any)
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', orderId);
  if (error) throw error;

  revalidatePath(`/orders/${orderId}`);
  revalidatePath('/orders');
}

// ─── Update admin memo ────────────────────────────────────────────────────────

export async function updateOrderAdminMemo(
  orderId: string,
  memo: string
): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('orders') as any)
    .update({ admin_memo: memo.trim() || null, updated_at: new Date().toISOString() })
    .eq('id', orderId);
  if (error) throw error;

  revalidatePath(`/orders/${orderId}`);
}
