import type { PaymentGateway } from './types';
import { MockProvider } from './providers/mock';

export function getPaymentProvider(): PaymentGateway {
  const provider = process.env.PAYMENT_PROVIDER ?? 'mock';

  switch (provider) {
    case 'mock':
      return new MockProvider();
    case 'stripe':
      throw new Error('Stripe provider not yet implemented. Set PAYMENT_PROVIDER=mock to continue.');
    case 'toss':
      throw new Error('Toss provider not yet implemented. Set PAYMENT_PROVIDER=mock to continue.');
    default:
      throw new Error(
        `Unknown PAYMENT_PROVIDER: "${provider}". Valid values: mock | stripe | toss`
      );
  }
}

export type { PaymentGateway, IntentResult, CaptureResult, RefundResult } from './types';
