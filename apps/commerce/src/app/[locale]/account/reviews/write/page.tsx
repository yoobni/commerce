import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { getReviewByOrderItemId } from '@/lib/reviews/queries';
import { ReviewForm } from '@/components/review/ReviewForm';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    orderItemId?: string;
    productId?: string;
    productName?: string;
    productThumbnail?: string;
    purchasedSize?: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'review' });
  return { title: t('writeReview') };
}

export default async function WriteReviewPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const sp = await searchParams;
  const { orderItemId, productId, productName, productThumbnail, purchasedSize } = sp;

  if (!orderItemId || !productId) notFound();

  // Auth guard
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  // Already reviewed?
  const { exists } = await getReviewByOrderItemId(orderItemId);
  if (exists) redirect(`/${locale}/account/orders`);

  const t = await getTranslations({ locale, namespace: 'review' });

  const item = {
    order_item_id: orderItemId,
    product_id: productId,
    product_name: productName ?? '',
    product_thumbnail: productThumbnail ?? '',
    purchased_size: purchasedSize ?? '',
  };

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      <div className="max-w-xl mx-auto px-4 py-8 md:py-12">
        {/* Back link */}
        <Link
          href={`/${locale}/account/orders`}
          className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors mb-6"
        >
          ← {t('backToOrders')}
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-border)] p-6">
          <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-6">
            {t('writeReview')}
          </h1>
          <ReviewForm item={item} locale={locale as Locale} />
        </div>
      </div>
    </div>
  );
}
