import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { listUserWishlist } from '@/lib/api/wishlist';
import { ProductCard } from '@/components/product/ProductCard';
import { Link } from '@/i18n/navigation';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'account.wishlist' });
  return { title: t('title') };
}

export default async function WishlistPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale, namespace: 'account.wishlist' });
  const tEmpty = await getTranslations({ locale, namespace: 'empty' });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const items = await listUserWishlist();

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
        {t('title')}
        {items.length > 0 && (
          <span className="ml-2 text-[var(--color-text-tertiary)] text-sm font-normal">
            ({items.length})
          </span>
        )}
      </h2>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-5xl mb-4">🤍</p>
          <p className="font-semibold text-[var(--color-text-primary)] mb-1">
            {tEmpty('wishlist.title')}
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            {tEmpty('wishlist.description')}
          </p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center h-10 px-5 rounded-lg bg-[var(--color-brand-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {tEmpty('wishlist.action')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {items.map((item) => (
            <ProductCard
              key={item.id}
              product={item.product}
              locale={locale as Locale}
              isAuthenticated={true}
              initialIsWishlisted={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
