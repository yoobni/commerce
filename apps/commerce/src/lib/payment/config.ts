/**
 * Payment provider configuration
 *
 * Preparation layer only — SDK is not bundled here.
 * Actual payment flows (PaymentIntent, webhook handlers) are wired up separately.
 */

import type { Currency } from '@commerce/types';

// ─── Supported providers ──────────────────────────────────────────────────────

/** Providers that can process a given currency */
export const CURRENCY_TO_PROVIDER: Record<Currency, 'stripe'> = {
  USD: 'stripe',
  EUR: 'stripe',
  JPY: 'stripe',
  KRW: 'stripe', // Stripe supports KRW via card; Toss added when keys confirmed
};

/** Stripe publishable key — safe to expose to client */
export const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

/** Returns true when Stripe keys are present in the environment */
export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
      process.env.STRIPE_SECRET_KEY
  );
}

// ─── Payment method availability per locale ───────────────────────────────────

export type PaymentMethodConfig = {
  id: 'CARD' | 'STRIPE' | 'KAKAO_PAY' | 'NAVER_PAY' | 'TOSS_PAY' | 'KLARNA';
  /** i18n key under checkout.payment.* */
  labelKey: string;
  /** Currency this method supports (null = any) */
  currencies: Currency[] | null;
  enabled: boolean;
};

export const PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: 'STRIPE',
    labelKey: 'creditCard',
    currencies: null,
    enabled: true,
  },
  {
    id: 'KLARNA',
    labelKey: 'klarna',
    currencies: ['USD', 'EUR'],
    enabled: false, // enable once Klarna agreement is in place
  },
  {
    id: 'KAKAO_PAY',
    labelKey: 'kakaoPay',
    currencies: ['KRW'],
    enabled: false, // enable after Kakao Partner signup
  },
  {
    id: 'NAVER_PAY',
    labelKey: 'naverPay',
    currencies: ['KRW'],
    enabled: false, // enable after Naver Pay Partner signup
  },
  {
    id: 'TOSS_PAY',
    labelKey: 'tossPay',
    currencies: ['KRW'],
    enabled: false, // enable after Toss Payments onboarding
  },
];

/** Returns methods available for a given currency */
export function getAvailablePaymentMethods(
  currency: Currency
): PaymentMethodConfig[] {
  return PAYMENT_METHODS.filter(
    (m) => m.enabled && (m.currencies === null || m.currencies.includes(currency))
  );
}
