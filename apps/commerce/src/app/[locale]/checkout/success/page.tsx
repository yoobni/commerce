import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound, redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/layout/Container';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    // Toss Payments redirects with these params after payment
    paymentKey?: string;
    orderId?: string;   // Toss orderId = our order_number
    amount?: string;
    // Our custom params passed in successUrl
    order_id?: string;  // our internal order UUID
    cart_id?: string;
    order_number?: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'checkout' });
  return { title: t('success.title') };
}

export default async function CheckoutSuccessPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const sp = await searchParams;
  const internalOrderId = sp.order_id;
  const cartId = sp.cart_id;

  // Toss redirect params (paymentKey + orderId are added by Toss to our successUrl)
  const tossPaymentKey = sp.paymentKey;
  const tossAmount = sp.amount ? parseInt(sp.amount, 10) : null;

  const t = await getTranslations({ locale, namespace: 'checkout' });
  const tAccount = await getTranslations({ locale, namespace: 'account' });

  let displayOrderNumber: string | null = sp.order_number ?? null;

  // ── Confirm payment with Toss (server-side) ────────────────────────────────
  if (tossPaymentKey && internalOrderId && tossAmount != null) {
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
      const confirmRes = await fetch(`${siteUrl}/api/payments/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentKey: tossPaymentKey,
          orderId: internalOrderId,
          amount: tossAmount,
          cartId,
        }),
        cache: 'no-store',
      });

      if (!confirmRes.ok) {
        // Payment confirmation failed — redirect to fail page
        redirect(`/${locale}/checkout/fail?order_id=${internalOrderId}&error=confirm_failed`);
      }

      const confirmData = (await confirmRes.json()) as { orderNumber?: string };
      displayOrderNumber = confirmData.orderNumber ?? displayOrderNumber;
    } catch {
      redirect(`/${locale}/checkout/fail?order_id=${internalOrderId}&error=confirm_error`);
    }
  }

  return (
    <div className="bg-[var(--color-bg)] min-h-screen flex items-center justify-center">
      <Container className="py-16 max-w-lg mx-auto text-center">
        {/* Success icon */}
        <div
          className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
          aria-hidden="true"
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#16a34a"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mb-3">
          {t('success.title')}
        </h1>

        <p className="text-[var(--color-text-secondary)] mb-2">
          {t('success.message')}
        </p>

        {displayOrderNumber && (
          <p className="text-sm text-[var(--color-text-tertiary)] mb-6">
            {t('success.orderNumber')}:{' '}
            <span className="font-mono font-medium text-[var(--color-text-primary)]">
              {displayOrderNumber}
            </span>
          </p>
        )}

        <p className="text-sm text-[var(--color-text-secondary)] mb-8">
          {t('success.estimatedDelivery')}: 3~5{locale === 'ko' ? '일' : ' days'}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/account/orders"
            className="inline-flex items-center justify-center h-11 px-6 rounded-lg border border-[var(--color-brand-primary)] text-[var(--color-brand-primary)] font-semibold text-sm hover:bg-[var(--color-brand-primary)] hover:text-white transition-colors"
          >
            {tAccount('orders.title')}
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-[var(--color-brand-primary)] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            {t('success.continueShopping')}
          </Link>
        </div>
      </Container>
    </div>
  );
}
