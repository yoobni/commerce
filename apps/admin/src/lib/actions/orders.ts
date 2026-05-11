'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/service';
import { requireRole } from '@/lib/auth/guard';
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

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<void> {
  await requireRole('OPERATOR');

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

// ─── Process refund ───────────────────────────────────────────────────────────

export async function processRefund(orderId: string, refundAmount: number): Promise<void> {
  const session = await requireRole('SUPER_ADMIN');

  const supabase = createServiceClient();

  // 1. Fetch order + payment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: order, error: orderError } = await (supabase.from('orders') as any)
    .select('id, status, user_id, coupon_issuance_id, point_used')
    .eq('id', orderId)
    .single();
  if (orderError || !order) throw new Error('주문을 찾을 수 없습니다.');
  if (order.status !== 'REFUND_REQUESTED') throw new Error('환불 요청 상태가 아닙니다.');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: payment, error: paymentError } = await (supabase.from('payments') as any)
    .select('id, payment_key, amount, refund_amount, status, provider')
    .eq('order_id', orderId)
    .single();
  if (paymentError || !payment) throw new Error('결제 정보를 찾을 수 없습니다.');
  if (!['PAID', 'PARTIALLY_REFUNDED'].includes(payment.status))
    throw new Error('환불 가능한 결제 상태가 아닙니다.');

  const alreadyRefunded: number = payment.refund_amount ?? 0;
  const maxRefundable: number = payment.amount - alreadyRefunded;
  if (refundAmount <= 0 || refundAmount > maxRefundable) {
    throw new Error(`환불 금액이 유효하지 않습니다. (최대: ${maxRefundable})`);
  }

  // 2. PG cancel (Toss Payments)
  const tossKey = process.env.TOSS_PAYMENTS_SECRET_KEY;
  if (tossKey) {
    const res = await fetch(
      `https://api.tosspayments.com/v1/payments/${payment.payment_key}/cancel`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${tossKey}:`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cancelReason: '관리자 환불', cancelAmount: refundAmount }),
      }
    );
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(`PG 취소 실패: ${(body as { message?: string }).message ?? res.statusText}`);
    }
  }

  const newRefundAmount = alreadyRefunded + refundAmount;
  const isFullRefund = newRefundAmount >= payment.amount;
  const newPaymentStatus = isFullRefund ? 'FULLY_REFUNDED' : 'PARTIALLY_REFUNDED';

  // 3. Update payment record
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: pmtErr } = await (supabase.from('payments') as any)
    .update({
      status: newPaymentStatus,
      refund_amount: newRefundAmount,
      refunded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment.id);
  if (pmtErr) throw pmtErr;

  // 4. Restore points if used
  if (isFullRefund && order.point_used > 0 && order.user_id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: pts } = await (supabase.from('points') as any)
      .select('balance')
      .eq('user_id', order.user_id)
      .single();
    const currentBalance: number = pts?.balance ?? 0;
    const newBalance = currentBalance + order.point_used;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('points') as any).upsert({
      user_id: order.user_id,
      balance: newBalance,
      updated_at: new Date().toISOString(),
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('point_transactions') as any).insert({
      user_id: order.user_id,
      type: 'CANCEL_USE',
      amount: order.point_used,
      balance_after: newBalance,
      reason: `주문 환불 (${orderId})`,
      reference_type: 'ORDER',
      reference_id: orderId,
      created_by: session.id,
    });
  }

  // 5. Restore coupon if fully refunded
  if (isFullRefund && order.coupon_issuance_id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('coupon_issuances') as any)
      .update({ status: 'ISSUED', used_at: null, used_order_id: null })
      .eq('id', order.coupon_issuance_id);
  }

  // 6. Restore stock for each order item (full refund only)
  if (isFullRefund) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: items } = await (supabase.from('order_items') as any)
      .select('product_option_id, quantity')
      .eq('order_id', orderId);
    if (items) {
      for (const item of items as { product_option_id: string; quantity: number }[]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.rpc as any)('increment_stock', {
          p_option_id: item.product_option_id,
          p_qty: item.quantity,
        })
          .then(() => null)
          .catch(() => null);
      }
    }
  }

  // 7. Update order status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: orderUpdateErr } = await (supabase.from('orders') as any)
    .update({ status: 'REFUNDED', updated_at: new Date().toISOString() })
    .eq('id', orderId);
  if (orderUpdateErr) throw orderUpdateErr;

  revalidatePath(`/orders/${orderId}`);
  revalidatePath('/orders');
}

// ─── Update admin memo ────────────────────────────────────────────────────────

export async function updateOrderAdminMemo(orderId: string, memo: string): Promise<void> {
  await requireRole('OPERATOR');

  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('orders') as any)
    .update({ admin_memo: memo.trim() || null, updated_at: new Date().toISOString() })
    .eq('id', orderId);
  if (error) throw error;

  revalidatePath(`/orders/${orderId}`);
}
