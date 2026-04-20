import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const TOSS_CONFIRM_URL = 'https://api.tosspayments.com/v1/payments/confirm';
const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY ?? '';

interface TossConfirmBody {
  paymentKey: string;
  orderId: string;      // our order_number
  amount: number;
}

interface TossPaymentResponse {
  paymentKey: string;
  orderId: string;
  orderName: string;
  status: string;
  method: string;
  totalAmount: number;
  currency: string;
  approvedAt: string;
  [key: string]: unknown;
}

export async function POST(req: NextRequest) {
  let body: TossConfirmBody;
  try {
    body = (await req.json()) as TossConfirmBody;
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const { paymentKey, orderId: orderNumber, amount } = body;
  if (!paymentKey || !orderNumber || !amount) {
    return NextResponse.json({ error: 'missing_params' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 });

  // Fetch the order by order_number and verify ownership + status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orderData } = await (supabase as any)
    .from('orders')
    .select('id, order_number, total_amount, status, currency')
    .eq('order_number', orderNumber)
    .eq('user_id', user.id)
    .single();

  if (!orderData) {
    return NextResponse.json({ error: 'order_not_found' }, { status: 404 });
  }

  const order = orderData as {
    id: string;
    order_number: string;
    total_amount: string | number;
    status: string;
    currency: string;
  };

  // Idempotency: already paid
  if (order.status === 'PAID') {
    return NextResponse.json({ success: true, orderId: order.id });
  }

  if (order.status !== 'PENDING_PAYMENT') {
    return NextResponse.json({ error: 'invalid_order_status' }, { status: 409 });
  }

  // Verify amount matches (prevent tampering)
  const expectedAmount = Math.round(Number(order.total_amount));
  if (amount !== expectedAmount) {
    return NextResponse.json({ error: 'amount_mismatch' }, { status: 400 });
  }

  // Call Toss confirm API
  const authHeader = `Basic ${Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64')}`;
  let tossRes: Response;
  try {
    tossRes = await fetch(TOSS_CONFIRM_URL, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId: orderNumber, amount }),
    });
  } catch {
    return NextResponse.json({ error: 'toss_network_error' }, { status: 502 });
  }

  const tossData = (await tossRes.json()) as TossPaymentResponse | { code: string; message: string };

  if (!tossRes.ok) {
    const errData = tossData as { code: string; message: string };
    // Mark order as cancelled / failed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('orders')
      .update({ status: 'CANCELLED', updated_at: new Date().toISOString() })
      .eq('id', order.id);
    return NextResponse.json(
      { error: 'payment_failed', code: errData.code, message: errData.message },
      { status: 400 }
    );
  }

  const payment = tossData as TossPaymentResponse;

  // Map Toss method → our PaymentMethod enum
  const methodMap: Record<string, string> = {
    카드: 'CARD',
    '카카오페이': 'KAKAO_PAY',
    '네이버페이': 'NAVER_PAY',
    '토스페이': 'TOSS_PAY',
    가상계좌: 'CARD',
    계좌이체: 'CARD',
  };
  const paymentMethod = methodMap[payment.method] ?? 'CARD';

  // Update order status → PAID
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('orders')
    .update({ status: 'PAID', updated_at: new Date().toISOString() })
    .eq('id', order.id);

  // Update order_items status → PREPARING
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('order_items')
    .update({ status: 'PREPARING' })
    .eq('order_id', order.id);

  // Record payment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('payments').insert({
    order_id: order.id,
    payment_key: paymentKey,
    method: paymentMethod,
    provider: 'TOSS_PAYMENTS',
    currency: order.currency,
    amount: amount,
    status: 'PAID',
    paid_at: payment.approvedAt ?? new Date().toISOString(),
    pg_response: payment,
  });

  // Clear cart (best-effort)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: cartData } = await (supabase as any)
    .from('carts')
    .select('id')
    .eq('user_id', user.id)
    .single();
  if (cartData) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('cart_items').delete().eq('cart_id', (cartData as { id: string }).id);
  }

  // Grant earn points (1% of total, KRW only, rounded to 10)
  if (order.currency === 'KRW') {
    const earnAmount = Math.floor(expectedAmount * 0.01 / 10) * 10;
    if (earnAmount >= 10) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: ptData } = await (supabase as any)
        .from('points')
        .select('balance, total_earned')
        .eq('user_id', user.id)
        .single();

      if (ptData) {
        const pt = ptData as { balance: number; total_earned: number };
        const newBalance = pt.balance + earnAmount;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('points')
          .update({ balance: newBalance, total_earned: pt.total_earned + earnAmount })
          .eq('user_id', user.id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('point_transactions').insert({
          user_id: user.id,
          type: 'EARN',
          amount: earnAmount,
          balance_after: newBalance,
          reason: `구매 적립 (${orderNumber})`,
          reference_type: 'ORDER',
          reference_id: order.id,
        });
      } else {
        // First points record
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('points').insert({
          user_id: user.id,
          balance: earnAmount,
          total_earned: earnAmount,
          total_used: 0,
          total_expired: 0,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('point_transactions').insert({
          user_id: user.id,
          type: 'EARN',
          amount: earnAmount,
          balance_after: earnAmount,
          reason: `구매 적립 (${orderNumber})`,
          reference_type: 'ORDER',
          reference_id: order.id,
        });
      }
    }
  }

  return NextResponse.json({ success: true, orderId: order.id });
}
