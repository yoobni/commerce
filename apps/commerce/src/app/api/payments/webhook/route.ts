import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/payments/webhook
 *
 * Toss Payments webhook handler (비동기 결제 상태 변경 알림).
 *
 * Toss sends webhooks for:
 *  - PAYMENT_STATUS_CHANGED  — payment status update
 *  - PAYMENT_FAILED          — payment failure
 *  - REFUND_STATUS_CHANGED   — refund status update
 *
 * Security:
 *  - Toss includes Authorization header: "Basic {base64(webhookSecretKey:)}"
 *  - We verify this header matches TOSS_WEBHOOK_SECRET env var
 *
 * Toss webhook spec:
 *   https://docs.tosspayments.com/reference/webhook
 *
 * NOTE: Webhook is a safety net for cases where the success page confirm
 * call succeeds on Toss side but the client redirect fails (network drop, etc.).
 * The /api/payments/confirm route is the primary path.
 */

function verifyTossSignature(req: NextRequest): boolean {
  const webhookSecret = process.env.TOSS_WEBHOOK_SECRET ?? '';
  if (!webhookSecret) return true; // skip verification in dev if not set

  const authHeader = req.headers.get('Authorization') ?? '';
  const expected = `Basic ${Buffer.from(`${webhookSecret}:`).toString('base64')}`;
  return authHeader === expected;
}

interface TossWebhookPayload {
  eventType: string;
  createdAt: string;
  data: {
    paymentKey: string;
    orderId: string; // Toss orderId = our order_number
    status: string;
    approvedAt?: string;
    cancelledAt?: string;
    method?: string;
    totalAmount?: number;
    cancels?: Array<{
      cancelAmount: number;
      canceledAt: string;
      cancelReason: string;
    }>;
  };
}

export async function POST(req: NextRequest) {
  // ── 1. Signature verification ────────────────────────────────────────────
  if (!verifyTossSignature(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let payload: TossWebhookPayload;
  try {
    payload = (await req.json()) as TossWebhookPayload;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { eventType, data } = payload;
  if (!eventType || !data?.orderId) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Look up order by order_number (which is what we pass as orderId to Toss)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: order } = await (admin as any)
    .from('orders')
    .select('id, status, coupon_issuance_id')
    .eq('order_number', data.orderId)
    .single();

  if (!order) {
    // Unknown order — ack to prevent Toss retry loops
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const orderId = (order as { id: string; status: string; coupon_issuance_id: string | null }).id;
  const currentStatus = (order as { status: string }).status;

  // ── 2. Handle by event type ───────────────────────────────────────────────
  switch (eventType) {
    case 'PAYMENT_STATUS_CHANGED': {
      if (data.status === 'DONE' && currentStatus !== 'PAID') {
        // Payment succeeded — may have been missed by success page confirm
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (admin as any)
          .from('payments')
          .update({
            payment_key: data.paymentKey,
            status: 'PAID',
            paid_at: data.approvedAt ?? new Date().toISOString(),
          })
          .eq('order_id', orderId)
          .eq('status', 'PENDING');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (admin as any)
          .from('orders')
          .update({ status: 'PAID' })
          .eq('id', orderId)
          .eq('status', 'PENDING_PAYMENT');

        // Mark coupon as used
        const couponIssuanceId = (order as { coupon_issuance_id: string | null }).coupon_issuance_id;
        if (couponIssuanceId) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (admin as any)
            .from('coupon_issuances')
            .update({ status: 'USED', used_at: new Date().toISOString(), used_order_id: orderId })
            .eq('id', couponIssuanceId)
            .eq('status', 'ISSUED');
        }
      } else if (data.status === 'CANCELED') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (admin as any)
          .from('payments')
          .update({ status: 'CANCELLED', cancelled_at: data.cancelledAt ?? new Date().toISOString() })
          .eq('order_id', orderId)
          .in('status', ['PENDING', 'PAID']);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (admin as any)
          .from('orders')
          .update({ status: 'CANCELLED' })
          .eq('id', orderId)
          .in('status', ['PENDING_PAYMENT', 'PAID']);
      }
      break;
    }

    case 'PAYMENT_FAILED': {
      if (currentStatus === 'PENDING_PAYMENT') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (admin as any)
          .from('payments')
          .update({ status: 'FAILED', failed_at: new Date().toISOString() })
          .eq('order_id', orderId)
          .eq('status', 'PENDING');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (admin as any)
          .from('orders')
          .update({ status: 'CANCELLED', cancel_reason: 'payment_failed' })
          .eq('id', orderId);
      }
      break;
    }

    case 'REFUND_STATUS_CHANGED': {
      const cancels = data.cancels ?? [];
      const totalRefund = cancels.reduce((sum, c) => sum + c.cancelAmount, 0);
      const isFullRefund = data.totalAmount != null && totalRefund >= data.totalAmount;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin as any)
        .from('payments')
        .update({
          status: isFullRefund ? 'FULLY_REFUNDED' : 'PARTIALLY_REFUNDED',
          refund_amount: totalRefund,
          refunded_at: cancels[0]?.canceledAt ?? new Date().toISOString(),
        })
        .eq('order_id', orderId);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin as any)
        .from('orders')
        .update({ status: isFullRefund ? 'REFUNDED' : currentStatus })
        .eq('id', orderId);
      break;
    }

    default:
      // Unknown event type — ack and ignore
      break;
  }

  // Always return 200 so Toss doesn't retry
  return NextResponse.json({ received: true }, { status: 200 });
}
