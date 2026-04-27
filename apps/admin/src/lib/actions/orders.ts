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

// ─── Process refund ──────────────────────────────────────────────────────────
// Handles: PG cancellation (Toss Payments) + payments table + points restore
// + coupon restore + stock restore + order status → REFUNDED

export interface ProcessRefundInput {
  reason: string;
  amount?: number; // partial refund amount; omit for full refund
}

export async function processRefund(
  orderId: string,
  input: ProcessRefundInput
): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const supabase = createServiceClient();
  const now = new Date().toISOString();

  // 1. Fetch order
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: order, error: orderErr } = await (supabase.from('orders') as any)
    .select('id, status, user_id, coupon_issuance_id, point_used, total_amount')
    .eq('id', orderId)
    .single();
  if (orderErr || !order) throw new Error('주문을 찾을 수 없습니다.');
  if (order.status !== 'REFUND_REQUESTED') throw new Error('환불 요청 상태의 주문만 환불 처리할 수 있습니다.');

  // 2. Fetch payment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: payment, error: payErr } = await (supabase.from('payments') as any)
    .select('id, payment_key, provider, amount, status')
    .eq('order_id', orderId)
    .single();
  if (payErr || !payment) throw new Error('결제 정보를 찾을 수 없습니다.');

  const refundAmount: number = input.amount ?? payment.amount;
  if (refundAmount <= 0 || refundAmount > payment.amount) {
    throw new Error(`환불 금액이 유효하지 않습니다. (최대: ${payment.amount})`);
  }

  // 3. PG cancellation — Toss Payments
  if (payment.provider === 'TOSS_PAYMENTS') {
    const secretKey = process.env.TOSS_PAYMENTS_SECRET_KEY;
    if (secretKey) {
      const isPartial = refundAmount < payment.amount;
      const pgRes = await fetch(
        `https://api.tosspayments.com/v1/payments/${payment.payment_key}/cancel`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cancelReason: input.reason,
            ...(isPartial ? { cancelAmount: refundAmount } : {}),
          }),
        }
      );
      if (!pgRes.ok) {
        const errData = await pgRes.json().catch(() => ({})) as { message?: string };
        throw new Error(errData.message ?? 'PG 환불 처리에 실패했습니다.');
      }
    }
  }

  // 4. Update payments record
  const isFullRefund = refundAmount >= payment.amount;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: payUpdateErr } = await (supabase.from('payments') as any)
    .update({
      status: isFullRefund ? 'FULLY_REFUNDED' : 'PARTIALLY_REFUNDED',
      refund_amount: refundAmount,
      refunded_at: now,
    })
    .eq('id', payment.id);
  if (payUpdateErr) throw payUpdateErr;

  // 5. Restore points (if used)
  if (order.point_used > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: pts } = await (supabase.from('points') as any)
      .select('balance, total_used')
      .eq('user_id', order.user_id)
      .single();

    if (pts) {
      const newBalance = pts.balance + order.point_used;
      const newTotalUsed = Math.max(0, pts.total_used - order.point_used);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('points') as any)
        .update({ balance: newBalance, total_used: newTotalUsed, updated_at: now })
        .eq('user_id', order.user_id);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('point_transactions') as any).insert({
        user_id: order.user_id,
        type: 'CANCEL_USE',
        amount: order.point_used,
        balance_after: newBalance,
        reason: `주문 환불 포인트 복구 (${orderId})`,
        reference_type: 'ORDER',
        reference_id: orderId,
        created_by: session.id,
      });
    }
  }

  // 6. Restore coupon issuance (if used)
  if (order.coupon_issuance_id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('coupon_issuances') as any)
      .update({ status: 'ISSUED', used_at: null, used_order_id: null })
      .eq('id', order.coupon_issuance_id);
  }

  // 7. Restore stock for each order item
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: items } = await (supabase.from('order_items') as any)
    .select('product_option_id, quantity')
    .eq('order_id', orderId);

  if (items && items.length > 0) {
    for (const item of items as Array<{ product_option_id: string; quantity: number }>) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: opt } = await (supabase.from('product_options') as any)
        .select('stock')
        .eq('id', item.product_option_id)
        .single();
      if (opt) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('product_options') as any)
          .update({ stock: opt.stock + item.quantity })
          .eq('id', item.product_option_id);
      }
    }
  }

  // 8. Update order status → REFUNDED
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: statusErr } = await (supabase.from('orders') as any)
    .update({ status: 'REFUNDED', updated_at: now })
    .eq('id', orderId);
  if (statusErr) throw statusErr;

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
