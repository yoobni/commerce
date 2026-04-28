import type {
  PaymentAdapter,
  PaymentMode,
  PaymentInitiateParams,
  PaymentInitiateResult,
  PaymentConfirmResult,
  PaymentCancelResult,
} from './payment';

export class MockPaymentAdapter implements PaymentAdapter {
  readonly mode: PaymentMode = 'mock';

  async initiate(params: PaymentInitiateParams): Promise<PaymentInitiateResult> {
    return {
      paymentRef: `mock_${params.orderId}_${Date.now()}`,
      redirectUrl: null,
    };
  }

  async confirm(paymentRef: string): Promise<PaymentConfirmResult> {
    return {
      status: 'PAID',
      paidAt: new Date().toISOString(),
      raw: { mock: true, paymentRef },
    };
  }

  async cancel(paymentRef: string, amount?: number): Promise<PaymentCancelResult> {
    return {
      refundedAt: new Date().toISOString(),
      raw: { mock: true, paymentRef, amount: amount ?? null },
    };
  }
}
