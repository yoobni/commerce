import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  CaptureParams,
  CaptureResult,
  CreateIntentParams,
  IntentResult,
  PaymentGateway,
  RefundParams,
  RefundResult,
} from '../payment.types';

// Mock PG used in dev/seed. createIntent is in-memory; capture writes a row to
// `payments` so the rest of the order pipeline (history, refunds) can find it.

export class MockProvider implements PaymentGateway {
  constructor(private readonly supabase: SupabaseClient) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createIntent(_params: CreateIntentParams): Promise<IntentResult> {
    const paymentIntentId = `mock_pi_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    return {
      clientSecret: `${paymentIntentId}_secret`,
      paymentIntentId,
    };
  }

  async capture(params: CaptureParams): Promise<CaptureResult> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase.from('payments') as any)
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
    if (error || !data) throw new Error(error?.message ?? 'capture_failed');
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
