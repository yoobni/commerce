'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/service';
import { getSession } from '@/lib/auth/session';
import type { OrderStatus, Carrier } from '@commerce/types';

// ─── State-machine: allowed admin transitions ─────────────────────────────────

const ALLOWED_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PAID: ['PREPARING', 'CANCELLED'],
  PREPARING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['CONFIRMED'],
  RETURN_REQUESTED: ['RETURNED'],
  RETURNED: ['REFUNDED'],
  REFUND_REQUESTED: ['REFUNDED'],
};

function assertTransition(from: OrderStatus, to: OrderStatus): void {
  const allowed = ALLOWED_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    throw new Error(`상태 전이 불가: ${from} → ${to}`);
  }
}

async function fetchOrderStatus(orderId: string): Promise<OrderStatus> {
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('orders') as any)
    .select('status')
    .eq('id', orderId)
    .single();
  if (error || !data) throw new Error('주문을 찾을 수 없습니다.');
  return (data as { status: OrderStatus }).status;
}

// ─── Confirm payment (PAID → PREPARING) ──────────────────────────────────────

export async function confirmPayment(orderId: string): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const currentStatus = await fetchOrderStatus(orderId);
  assertTransition(currentStatus, 'PREPARING');

  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('orders') as any)
    .update({ status: 'PREPARING', updated_at: new Date().toISOString() })
    .eq('id', orderId);
  if (error) throw error;

  revalidatePath(`/orders/${orderId}`);
  revalidatePath('/orders');
}

// ─── Start shipment (PREPARING → SHIPPED) ────────────────────────────────────

export interface StartShipmentInput {
  orderId: string;
  carrier: Carrier;
  trackingNumber: string;
  country: string;
}

export async function startShipment(input: StartShipmentInput): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  if (!input.trackingNumber.trim()) throw new Error('운송장 번호를 입력해주세요.');

  const currentStatus = await fetchOrderStatus(input.orderId);
  assertTransition(currentStatus, 'SHIPPED');

  const supabase = createServiceClient();
  const now = new Date().toISOString();

  // Upsert shipment record (create if not exists, update if already there)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: shipError } = await (supabase.from('shipments') as any).upsert(
    {
      order_id: input.orderId,
      carrier: input.carrier,
      tracking_number: input.trackingNumber.trim(),
      country: input.country,
      status: 'IN_TRANSIT',
      shipped_at: now,
    },
    { onConflict: 'order_id' }
  );
  if (shipError) throw shipError;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('orders') as any)
    .update({ status: 'SHIPPED', updated_at: now })
    .eq('id', input.orderId);
  if (error) throw error;

  revalidatePath(`/orders/${input.orderId}`);
  revalidatePath('/orders');
}

// ─── Mark delivered (SHIPPED → DELIVERED) ────────────────────────────────────

export async function markDelivered(orderId: string): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const currentStatus = await fetchOrderStatus(orderId);
  assertTransition(currentStatus, 'DELIVERED');

  const supabase = createServiceClient();
  const now = new Date().toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('shipments') as any)
    .update({ status: 'DELIVERED', delivered_at: now, updated_at: now })
    .eq('order_id', orderId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('orders') as any)
    .update({ status: 'DELIVERED', updated_at: now })
    .eq('id', orderId);
  if (error) throw error;

  revalidatePath(`/orders/${orderId}`);
  revalidatePath('/orders');
}

// ─── Confirm order (DELIVERED → CONFIRMED) ───────────────────────────────────

export async function confirmOrder(orderId: string): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const currentStatus = await fetchOrderStatus(orderId);
  assertTransition(currentStatus, 'CONFIRMED');

  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('orders') as any)
    .update({ status: 'CONFIRMED', updated_at: new Date().toISOString() })
    .eq('id', orderId);
  if (error) throw error;

  revalidatePath(`/orders/${orderId}`);
  revalidatePath('/orders');
}

// ─── Complete return (RETURN_REQUESTED → RETURNED) ───────────────────────────

export async function completeReturn(orderId: string): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const currentStatus = await fetchOrderStatus(orderId);
  assertTransition(currentStatus, 'RETURNED');

  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('orders') as any)
    .update({ status: 'RETURNED', updated_at: new Date().toISOString() })
    .eq('id', orderId);
  if (error) throw error;

  revalidatePath(`/orders/${orderId}`);
  revalidatePath('/orders');
}

// ─── Process refund (RETURNED | REFUND_REQUESTED → REFUNDED) ─────────────────

export interface ProcessRefundInput {
  orderId: string;
  refundAmount: number;
}

export async function processRefund(input: ProcessRefundInput): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  if (input.refundAmount <= 0) throw new Error('환불 금액은 0보다 커야 합니다.');

  const currentStatus = await fetchOrderStatus(input.orderId);
  assertTransition(currentStatus, 'REFUNDED');

  const supabase = createServiceClient();
  const now = new Date().toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: orderError } = await (supabase.from('orders') as any)
    .update({ status: 'REFUNDED', updated_at: now })
    .eq('id', input.orderId);
  if (orderError) throw orderError;

  // Record refund on payment (non-blocking: payment record may not exist in dev)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('payments') as any)
    .update({
      status: 'FULLY_REFUNDED',
      refund_amount: input.refundAmount,
      refunded_at: now,
      updated_at: now,
    })
    .eq('order_id', input.orderId);

  revalidatePath(`/orders/${input.orderId}`);
  revalidatePath('/orders');
}

// ─── Cancel order (PAID | PREPARING → CANCELLED) ─────────────────────────────

export async function cancelOrder(orderId: string): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const currentStatus = await fetchOrderStatus(orderId);
  assertTransition(currentStatus, 'CANCELLED');

  const supabase = createServiceClient();
  const now = new Date().toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: orderError } = await (supabase.from('orders') as any)
    .update({ status: 'CANCELLED', updated_at: now })
    .eq('id', orderId);
  if (orderError) throw orderError;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('payments') as any)
    .update({ status: 'CANCELLED', cancelled_at: now, updated_at: now })
    .eq('order_id', orderId);

  revalidatePath(`/orders/${orderId}`);
  revalidatePath('/orders');
}

// ─── Update admin memo ────────────────────────────────────────────────────────

export async function updateAdminMemo(orderId: string, memo: string): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('orders') as any)
    .update({ admin_memo: memo || null, updated_at: new Date().toISOString() })
    .eq('id', orderId);
  if (error) throw error;

  revalidatePath(`/orders/${orderId}`);
}
