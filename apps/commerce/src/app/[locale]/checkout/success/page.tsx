import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/layout/Container';
import { createClient } from '@/lib/supabase/server';
import { getOrderById } from '@/lib/api/orders';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order_id?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'checkout' });
  return { title: t('success.title'), robots: { index: false, follow: false } };
}

export default async function CheckoutSuccessPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const sp = await searchParams;
  const orderId = sp.order_id;

  // Only show the success screen for an order that (a) exists in the database,
  // (b) belongs to the current user, and (c) is in a paid/processing state.
  // Reject demo/placeholder IDs and any direct URL hits.
  if (!orderId || orderId.startsWith('demo_')) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const order = await getOrderById(orderId);
  if (!order) notFound();
  const paidStatuses = new Set(['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED']);
  if (!paidStatuses.has((order as { status: string }).status)) notFound();

  const t = await getTranslations({ locale, namespace: 'checkout' });
  const tAccount = await getTranslations({ locale, namespace: 'account' });

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

        <p className="text-[var(--color-text-secondary)] mb-2">{t('success.message')}</p>

        {orderId && (
          <p className="text-sm text-[var(--color-text-tertiary)] mb-6">
            {t('success.orderNumber')}:{' '}
            <span className="font-mono font-medium text-[var(--color-text-primary)]">
              {orderId}
            </span>
          </p>
        )}

        <p className="text-sm text-[var(--color-text-secondary)] mb-8">
          {t('success.estimatedDelivery')}: {t('success.estimatedDeliveryRange')}
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
