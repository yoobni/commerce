'use server';

import { createClient } from '@/lib/supabase/server';
import type {
  PaymentGateway,
  CreateIntentParams,
  IntentResult,
  CaptureParams,
  CaptureResult,
  RefundParams,
  RefundResult,
} from '../types';

export class MockProvider implements PaymentGateway {
  async createIntent(params: CreateIntentParams): Promise<IntentResult> {
    const paymentIntentId = `mock_pi_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    return {
      clientSecret: `${paymentIntentId}_secret`,
      paymentIntentId,
    };
  }

  async capture(params: CaptureParams): Promise<CaptureResult> {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('payments') as any)
      .insert({
        order_id: params.orderId,
        payment_key: params.paymentIntentId,
        method: 'CARD',
        provider: 'MOCK',
        currency: params.currency.toUpperCase(),
        amount: params.amount,
        status: 'MOCK_SUCCEEDED',
        paid_at: new Date().toISOString(),
        pg_response: { mock: true, payment_intent_id: params.paymentIntentId },
      })
      .select('id')
      .single();

    if (error) throw new Error(error.message);
    return { paymentId: (data as { id: string }).id, status: 'MOCK_SUCCEEDED' };
  }

  async refund(params: RefundParams): Promise<RefundResult> {
    return {
      refundId: `mock_refund_${Date.now()}`,
      status: 'MOCK_REFUNDED',
      refundedAmount: params.amount ?? 0,
    };
  }
}
