import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { clearCartAction } from '@/lib/cart/actions';

/**
 * POST /api/payments/confirm
 *
 * Called from the checkout success page (server-side redirect handler).
 * Confirms payment with Toss Payments API, then updates DB.
 *
 * Body: { paymentKey: string; orderId: string; amount: number; cartId?: string }
 *
 * Flow:
 *  1. Validate request body
 *  2. Fetch order from DB — verify amount matches (tampering guard)
 *  3. Check idempotency — if already PAID, return success immediately
 *  4. Call Toss Payments /v1/payments/confirm
 *  5. Update payment record: status=PAID, payment_key=real key, pg_response
 *  6. Update order record: status=PAID
 *  7. If coupon was applied: mark coupon_issuance as USED
 *  8. Clear cart
 *  9. Return { orderNumber }
 *
 * Toss Payments API ref:
 *   https://docs.tosspayments.com/reference#결제-승인
 */

const TOSS_CONFIRM_URL = 'https://api.tosspayments.com/v1/payments/confirm';

function getTossAuthHeader(): string {
  const secretKey = process.env.TOSS_SECRET_KEY ?? '';
  // Toss uses HTTP Basic Auth: base64(secretKey + ':')
  return `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`;
}

export async function POST(req: NextRequest) {
  let body: { paymentKey?: string; orderId?: string; amount?: number; cartId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { paymentKey, orderId, amount, cartId } = body;

  if (!paymentKey || !orderId || amount == null) {
    return NextResponse.json({ error: 'missing_params' }, { status: 400 });
  }

  const admin = createAdminClient();

  // ── 1. Fetch order (orderId here is our internal order ID) ───────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: order, error: orderFetchError } = await (admin as any)
    .from('orders')
    .select('id, order_number, status, total_amount, currency, coupon_issuance_id')
    .eq('id', orderId)
    .single();

  if (orderFetchError || !order) {
    return NextResponse.json({ error: 'order_not_found' }, { status: 404 });
  }

  const orderRow = order as {
    id: string;
    order_number: string;
    status: string;
    total_amount: number;
    currency: string;
    coupon_issuance_id: string | null;
  };

  // ── 2. Idempotency check ─────────────────────────────────────────────────
  if (orderRow.status === 'PAID') {
    return NextResponse.json({ orderNumber: orderRow.order_number }, { status: 200 });
  }

  if (orderRow.status !== 'PENDING_PAYMENT') {
    return NextResponse.json({ error: 'invalid_order_status' }, { status: 409 });
  }

  // ── 3. Amount tampering guard ────────────────────────────────────────────
  // Toss amount must match our recorded total (integer KRW) or float for other currencies
  const expectedAmount = Math.round(Number(orderRow.total_amount));
  if (Math.round(amount) !== expectedAmount) {
    return NextResponse.json({ error: 'amount_mismatch' }, { status: 400 });
  }

  // ── 4. Call Toss Payments confirm ────────────────────────────────────────
  let pgResponse: Record<string, unknown>;
  let tossOk = false;

  try {
    const tossRes = await fetch(TOSS_CONFIRM_URL, {
      method: 'POST',
      headers: {
        Authorization: getTossAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId: orderRow.order_number, amount }),
    });

    pgResponse = (await tossRes.json()) as Record<string, unknown>;
    tossOk = tossRes.ok;
  } catch {
    return NextResponse.json({ error: 'pg_unreachable' }, { status: 502 });
  }

  if (!tossOk) {
    // Log failure and update payment status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from('payments')
      .update({
        status: 'FAILED',
        failed_at: new Date().toISOString(),
        pg_response: pgResponse,
      })
      .eq('order_id', orderId)
      .eq('status', 'PENDING');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from('orders')
      .update({ status: 'CANCELLED', cancel_reason: 'payment_failed' })
      .eq('id', orderId);

    const pgError = (pgResponse.message as string | undefined) ?? 'pg_error';
    return NextResponse.json({ error: pgError, pg: pgResponse }, { status: 402 });
  }

  // ── 5. Update payment record ─────────────────────────────────────────────
  const paidAt = (pgResponse.approvedAt as string | undefined) ?? new Date().toISOString();
  const pgMethod = pgResponse.method as string | undefined;

  // Map Toss method string to our enum
  const methodMap: Record<string, string> = {
    '카드': 'CARD',
    '간편결제': 'CARD', // Toss Pay, Kakao Pay go through 간편결제
    '가상계좌': 'CARD',
    '계좌이체': 'CARD',
  };
  const resolvedMethod = (pgMethod && methodMap[pgMethod]) ?? 'CARD';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any)
    .from('payments')
    .update({
      payment_key: paymentKey,
      method: resolvedMethod,
      status: 'PAID',
      paid_at: paidAt,
      pg_response: pgResponse,
    })
    .eq('order_id', orderId);

  // ── 6. Update order status ────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any)
    .from('orders')
    .update({ status: 'PAID' })
    .eq('id', orderId);

  // ── 7. Mark coupon as used ────────────────────────────────────────────────
  if (orderRow.coupon_issuance_id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from('coupon_issuances')
      .update({
        status: 'USED',
        used_at: new Date().toISOString(),
        used_order_id: orderId,
      })
      .eq('id', orderRow.coupon_issuance_id);
  }

  // ── 8. Clear cart (best-effort — not fatal if fails) ─────────────────────
  if (cartId) {
    await clearCartAction(cartId).catch(() => {/* non-fatal */});
  }

  return NextResponse.json({ orderNumber: orderRow.order_number }, { status: 200 });
}
