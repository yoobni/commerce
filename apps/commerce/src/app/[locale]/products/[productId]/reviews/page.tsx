import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { getProductRatingStats } from '@/lib/reviews/queries';
import { ReviewList } from '@/components/review/ReviewList';

type Props = {
  params: Promise<{ locale: string; productId: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'review' });
  return { title: t('title') };
}

export default async function ProductReviewsPage({ params, searchParams }: Props) {
  const { locale, productId } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);

  // Check if product exists
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: product } = await (supabase as any)
    .from('products')
    .select('id, name_ko, name_en, slug')
    .eq('id', productId)
    .eq('status', 'ACTIVE')
    .maybeSingle();

  if (!product) notFound();

  // Check if user is authenticated (to show write review button)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const t = await getTranslations({ locale, namespace: 'review' });

  // Build write review href (user needs to come from their orders)
  const writeReviewHref = user
    ? `/${locale}/account/orders`
    : `/${locale}/auth/login`;

  const stats = await getProductRatingStats(productId);

  // Localized product name
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = product as any;
  const productName: string =
    (locale === 'ko' ? p.name_ko : p.name_en) ?? p.name_en ?? '';

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        {/* Back link */}
        <Link
          href={`/${locale}/products/${p.slug}`}
          className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors mb-6"
        >
          ← {t('backToProduct')}
        </Link>

        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
          {productName}
        </h1>
        {stats.total > 0 && (
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            {t('stats.totalReviews', { count: stats.total })}
          </p>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-border)] p-6">
          <ReviewList
            productId={productId}
            locale={locale as Locale}
            page={page}
            writeReviewHref={writeReviewHref}
          />
        </div>
      </div>
    </div>
  );
}
