import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const TOSS_CONFIRM_URL = 'https://api.tosspayments.com/v1/payments/confirm';

interface ConfirmRequestBody {
  paymentKey: string;
  orderId: string;
  amount: number;
}

interface TossPaymentResponse {
  paymentKey: string;
  orderId: string;
  status: string;
  method: string;
  totalAmount: number;
  currency: string;
  approvedAt: string | null;
  [key: string]: unknown;
}

function getTossAuthHeader(): string {
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) throw new Error('TOSS_SECRET_KEY is not configured');
  // TossPayments: base64(secretKey + ":")
  const encoded = Buffer.from(`${secretKey}:`).toString('base64');
  return `Basic ${encoded}`;
}

function mapTossMethod(method: string): string {
  const map: Record<string, string> = {
    '카드': 'CARD',
    '가상계좌': 'VIRTUAL_ACCOUNT',
    '간편결제': 'TOSS_PAY',
    '휴대폰': 'MOBILE',
    '계좌이체': 'TRANSFER',
  };
  return map[method] ?? 'CARD';
}

export async function POST(request: NextRequest) {
  let body: ConfirmRequestBody;

  try {
    body = (await request.json()) as ConfirmRequestBody;
  } catch {
    return NextResponse.json(
      { error: { code: 'INVALID_REQUEST', message: 'Invalid JSON body' } },
      { status: 400 }
    );
  }

  const { paymentKey, orderId, amount } = body;

  if (!paymentKey || !orderId || !amount) {
    return NextResponse.json(
      { error: { code: 'MISSING_PARAMS', message: 'paymentKey, orderId, amount are required' } },
      { status: 400 }
    );
  }

  // ── 1. Toss 결제 승인 ────────────────────────────────────────────────────────
  let tossData: TossPaymentResponse;
  try {
    const tossRes = await fetch(TOSS_CONFIRM_URL, {
      method: 'POST',
      headers: {
        Authorization: getTossAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    tossData = (await tossRes.json()) as TossPaymentResponse;

    if (!tossRes.ok) {
      const tossError = tossData as { code?: string; message?: string };
      return NextResponse.json(
        {
          error: {
            code: tossError.code ?? 'TOSS_ERROR',
            message: tossError.message ?? 'Payment confirmation failed',
          },
        },
        { status: tossRes.status }
      );
    }
  } catch (err) {
    console.error('[payments/confirm] Toss API error:', err);
    return NextResponse.json(
      { error: { code: 'TOSS_UNREACHABLE', message: 'Failed to reach TossPayments API' } },
      { status: 502 }
    );
  }

  // ── 2. Supabase에 결제 기록 저장 ─────────────────────────────────────────────
  try {
    const supabase = await createClient();

    const { error: dbError } = await supabase.from('payments').insert({
      order_id: orderId,
      payment_key: tossData.paymentKey,
      method: mapTossMethod(tossData.method),
      provider: 'TOSS_PAYMENTS',
      currency: (tossData.currency as string).toUpperCase(),
      amount: tossData.totalAmount,
      status: tossData.status === 'DONE' ? 'PAID' : 'PENDING',
      paid_at: tossData.approvedAt ?? null,
      failed_at: null,
      cancelled_at: null,
      refund_amount: null,
      refunded_at: null,
      pg_response: tossData,
    });

    if (dbError) {
      // 결제는 이미 승인됨 — DB 실패는 로깅 후 성공 응답 유지 (운영에서는 별도 reconcile)
      console.error('[payments/confirm] Supabase insert error:', dbError);
    }

    // 주문 상태 업데이트
    await supabase
      .from('orders')
      .update({ status: 'PAID' })
      .eq('order_number', orderId);
  } catch (err) {
    console.error('[payments/confirm] DB error:', err);
    // DB 오류는 비치명적 처리 (결제는 이미 완료)
  }

  return NextResponse.json({ data: tossData, error: null });
}
