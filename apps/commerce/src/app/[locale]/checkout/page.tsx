import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound, redirect } from 'next/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { getCartWithItems } from '@/lib/api/cart';
import { getAddresses } from '@/lib/account/queries';
import { getUserPointBalance } from '@/lib/api/points';
import { getUserCoupons } from '@/lib/api/coupons';
import { Container } from '@/components/layout/Container';
import { CheckoutClient } from './_components/CheckoutClient';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'checkout' });
  return { title: t('title') };
}

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/${locale}/checkout`);
  }

  const [cart, addresses, pointData, availableCoupons] = await Promise.all([
    getCartWithItems(),
    getAddresses(user.id),
    getUserPointBalance(),
    getUserCoupons(),
  ]);

  if (!cart || cart.items.length === 0) {
    redirect(`/${locale}/cart`);
  }

  const t = await getTranslations({ locale, namespace: 'checkout' });

  return (
    <div className="bg-[var(--mz-bg)] min-h-screen">
      <Container className="py-8 md:py-12 pb-32 lg:pb-12">
        <h1 className="font-serif text-[28px] md:text-[34px] font-medium leading-[1.1] tracking-[-0.025em] text-[var(--mz-ink)] mb-6">
          {t('title')}
        </h1>
        <CheckoutClient
          cart={cart}
          addresses={addresses}
          locale={locale as Locale}
          pointBalance={pointData?.balance ?? 0}
          availableCoupons={availableCoupons}
        />
      </Container>
    </div>
  );
}
