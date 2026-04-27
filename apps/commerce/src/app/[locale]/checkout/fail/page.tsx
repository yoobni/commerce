import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/layout/Container';
import { cancelPendingOrderAction } from '@/lib/orders/actions';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    order_id?: string;
    error?: string;
    // Toss Payments adds these on failUrl redirect
    code?: string;
    message?: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'checkout' });
  return { title: t('fail.title') };
}

export default async function CheckoutFailPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const sp = await searchParams;
  const orderId = sp.order_id;
  const errorCode = sp.error ?? sp.code ?? 'unknown';

  const t = await getTranslations({ locale, namespace: 'checkout' });

  // Cancel the pending order (best-effort — non-fatal if already cancelled)
  if (orderId) {
    await cancelPendingOrderAction(orderId).catch(() => {/* non-fatal */});
  }

  return (
    <div className="bg-[var(--color-bg)] min-h-screen flex items-center justify-center">
      <Container className="py-16 max-w-lg mx-auto text-center">
        {/* Fail icon */}
        <div
          className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6"
          aria-hidden="true"
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#dc2626"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mb-3">
          {t('fail.title')}
        </h1>

        <p className="text-[var(--color-text-secondary)] mb-2">
          {t('fail.message')}
        </p>

        {errorCode !== 'unknown' && (
          <p className="text-xs font-mono text-[var(--color-text-tertiary)] mb-6">
            {t('fail.errorCode')}: {errorCode}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link
            href="/cart"
            className="inline-flex items-center justify-center h-11 px-6 rounded-lg border border-[var(--color-brand-primary)] text-[var(--color-brand-primary)] font-semibold text-sm hover:bg-[var(--color-brand-primary)] hover:text-white transition-colors"
          >
            {t('fail.backToCart')}
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-[var(--color-neutral-100)] text-[var(--color-text-primary)] font-semibold text-sm hover:bg-[var(--color-neutral-200)] transition-colors"
          >
            {t('fail.continueShopping')}
          </Link>
        </div>
      </Container>
    </div>
  );
}
