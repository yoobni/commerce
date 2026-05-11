import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { getCartWithItems } from '@/lib/cart/queries';
import { CartClient } from './_components/CartClient';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'cart' });
  return { title: t('title') };
}

export default async function CartPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const initialCart = user ? await getCartWithItems() : null;

  return (
    <div className="min-h-screen bg-[var(--mz-bg)]">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <CartClient locale={locale as Locale} initialCart={initialCart} isAuthenticated={!!user} />
      </div>
    </div>
  );
}
