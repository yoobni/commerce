import type { PaymentAdapter, PaymentMode } from './payment';
import type { ShippingAdapter } from './shipping';
import { MockPaymentAdapter } from './mock-payment';
import { MockShippingAdapter } from './mock-shipping';

function getPaymentMode(): PaymentMode {
  const mode = process.env.PAYMENT_MODE;
  if (mode === 'real') return 'real';
  return 'mock';
}

export function createPaymentAdapter(): PaymentAdapter {
  const mode = getPaymentMode();
  if (mode === 'real') {
    throw new Error(
      'Real PaymentAdapter is not implemented yet. Set PAYMENT_MODE=mock or implement a real adapter.'
    );
  }
  return new MockPaymentAdapter();
}

export function createShippingAdapter(): ShippingAdapter {
  const mode = getPaymentMode();
  if (mode === 'real') {
    throw new Error(
      'Real ShippingAdapter is not implemented yet. Set PAYMENT_MODE=mock or implement a real adapter.'
    );
  }
  return new MockShippingAdapter();
}
