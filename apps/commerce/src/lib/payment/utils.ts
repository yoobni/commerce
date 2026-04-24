/**
 * Payment utility functions
 *
 * - toStripeAmount: convert display amount → Stripe cents/subunit
 * - fromStripeAmount: convert Stripe subunit → display amount
 * - formatPaymentError: map raw PG error messages → user-facing keys
 */

import type { Currency } from '@commerce/types';

/** Currencies that Stripe treats as zero-decimal (no conversion needed) */
const ZERO_DECIMAL_CURRENCIES: Currency[] = ['JPY', 'KRW'];

/**
 * Convert a display amount (e.g. 29.99 USD) to the integer Stripe expects.
 * JPY/KRW are zero-decimal — pass as-is.
 */
export function toStripeAmount(amount: number, currency: Currency): number {
  if (ZERO_DECIMAL_CURRENCIES.includes(currency)) return Math.round(amount);
  return Math.round(amount * 100);
}

/**
 * Convert a Stripe subunit amount back to the display amount.
 */
export function fromStripeAmount(amount: number, currency: Currency): number {
  if (ZERO_DECIMAL_CURRENCIES.includes(currency)) return amount;
  return amount / 100;
}

/**
 * Map raw Stripe decline codes to i18n error keys (checkout.error.*).
 * Unknown codes fall back to 'paymentFailed'.
 */
export function mapStripeDeclineCode(code: string | null | undefined): string {
  switch (code) {
    case 'card_declined':
    case 'do_not_honor':
      return 'cardDeclined';
    case 'insufficient_funds':
      return 'insufficientFunds';
    case 'expired_card':
      return 'cardExpired';
    case 'incorrect_cvc':
      return 'incorrectCvc';
    case 'processing_error':
      return 'processingError';
    default:
      return 'paymentFailed';
  }
}

/**
 * Minimal Stripe PaymentIntent shape — avoids importing @stripe/stripe-js
 * at the preparation stage. Expand once the SDK is wired.
 */
export interface StripePaymentIntentStub {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status:
    | 'requires_payment_method'
    | 'requires_action'
    | 'processing'
    | 'succeeded'
    | 'canceled';
}
