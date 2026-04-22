import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound, redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { getOrders } from '@/lib/orders/queries';
import { OrderListClient } from './_components/OrderListClient';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'orders' });
  return { title: t('title') };
}

export default async function OrdersPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/auth/login`);

  const orders = await getOrders();

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        <OrderListClient locale={locale as Locale} orders={orders} />
      </div>
    </div>
  );
}
