import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { routing, type Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProductBySlug, listProducts } from '@/lib/api/products';
import { listProductReviews, getReviewStats } from '@/lib/queries/reviews';
import { ReviewSection } from '@/components/product/ReviewSection';
import {
  getProductName,
  getProductDescription,
  getProductPrice,
  formatPrice,
  getCategoryName,
} from '@/lib/format';
import { Container } from '@/components/layout/Container';
import { PDPImageGallery } from '@/components/product/PDPImageGallery';
import { CategoryBreadcrumb } from '@/components/product/CategoryBreadcrumb';
import { ProductCard } from '@/components/product/ProductCard';
import { FitForHanaCard } from '@/components/ui/FitForHanaCard';
import { ProductGridSkeleton, Skeleton } from '@/components/ui/Skeleton';
import { PDPClient } from './_components/PDPClient';
import { RelatedCommunityPosts } from '@/components/community/RelatedCommunityPosts';
import { buildAlternates } from '@/lib/seo/alternates';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const name = getProductName(product, locale as Locale);
  return {
    title: name,
    description: getProductDescription(product, locale as Locale).slice(0, 160),
    openGraph: {
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
    alternates: buildAlternates(`/products/${slug}`, locale),
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale, namespace: 'product' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const product = await getProductBySlug(slug);
  if (!product || product.status !== 'ACTIVE') notFound();

  const productName = getProductName(product, locale as Locale);
  const productDescription = getProductDescription(product, locale as Locale);
  const price = getProductPrice(product, locale as Locale);

  const [reviews, reviewStats, relatedResult] = await Promise.all([
    listProductReviews(product.id, { per_page: 5 }),
    getReviewStats(product.id),
    listProducts({
      category_slug: product.category?.slug,
      per_page: 4,
      sort: 'popular',
    }),
  ]);

  const relatedProducts = relatedResult.data.filter((p) => p.id !== product.id).slice(0, 4);

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productName,
    description: productDescription.slice(0, 300),
    image: product.images?.length ? product.images : undefined,
    sku: product.id,
    brand: { '@type': 'Brand', name: 'RAVI' },
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency:
        locale === 'ko' ? 'KRW' : locale === 'ja' ? 'JPY' : locale === 'de' ? 'EUR' : 'USD',
      availability:
        product.status === 'ACTIVE'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/${locale}/products/${slug}`,
    },
    aggregateRating:
      product.review_count > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: product.review_avg_rating,
            reviewCount: product.review_count,
          }
        : undefined,
  };

  // Spec rows — Muzzle M8 "About this piece" 4-row table.
  // Source fields are optional; render only rows that have data.
  const specRows: [string, string][] = [
    product.material ? [t('material'), product.material] : null,
    product.care_instruction ? [t('care'), product.care_instruction] : null,
    product.weight_g ? [t('weight'), `${product.weight_g}g`] : null,
  ].filter((row): row is [string, string] => row !== null);

  return (
    <div className="bg-[var(--mz-bg)] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <Container className="py-6 md:py-10">
        {/* Breadcrumb */}
        <div className="mb-6">
          {product.category ? (
            <CategoryBreadcrumb
              category={product.category}
              parentCategory={null}
              productName={productName}
              locale={locale as Locale}
              homeLabel={tNav('home')}
              shopLabel={tNav('shop')}
            />
          ) : (
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-1 text-[11px] text-[var(--mz-ink-mute)]">
                <li>
                  <Link href="/" className="hover:text-[var(--mz-ink)] transition-colors">
                    {tNav('home')}
                  </Link>
                </li>
                <li className="flex items-center gap-1">
                  <span aria-hidden="true">›</span>
                  <Link
                    href="/products"
                    className="hover:text-[var(--mz-ink)] transition-colors"
                  >
                    {tNav('shop')}
                  </Link>
                </li>
                <li className="flex items-center gap-1">
                  <span aria-hidden="true">›</span>
                  <span className="text-[var(--mz-ink)] font-medium" aria-current="page">
                    {productName}
                  </span>
                </li>
              </ol>
            </nav>
          )}
        </div>

        {/* Main PDP layout — 2-col on md+, stacked on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 mb-16">
          {/* Left: Image gallery (sticky on desktop) */}
          <div className="md:sticky md:top-24 md:self-start">
            <PDPImageGallery
              images={product.images.length > 0 ? product.images : [product.thumbnail_url]}
              productName={productName}
              productId={product.id}
            />
          </div>

          {/* Right: Buy rail */}
          <div className="space-y-6">
            {/* Eyebrow — category */}
            {product.category && (
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--mz-ink-mute)]">
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="hover:text-[var(--mz-ink)] transition-colors"
                >
                  {getCategoryName(product.category, locale as Locale)}
                </Link>
              </p>
            )}

            {/* Title — Fraunces 26-32/500 -0.025em */}
            <h1 className="font-serif text-[26px] md:text-[32px] font-medium leading-[1.1] tracking-[-0.025em] text-[var(--mz-ink)] mt-1">
              {productName}
            </h1>

            {/* Price + rating row */}
            <div className="flex items-baseline gap-4 -mt-2">
              <span className="font-serif text-[22px] font-semibold text-[var(--mz-ink)]">
                {formatPrice(price, locale as Locale)}
              </span>
              {product.review_count > 0 && (
                <a
                  href="#reviews"
                  className="text-[12px] text-[var(--mz-ink-mute)] hover:text-[var(--mz-ink)] transition-colors"
                  aria-label={`Rating: ${product.review_avg_rating.toFixed(1)} out of 5, ${product.review_count} reviews`}
                >
                  <span className="text-[var(--mz-accent)]" aria-hidden="true">
                    ★
                  </span>{' '}
                  {product.review_avg_rating.toFixed(1)} ({product.review_count})
                </a>
              )}
            </div>

            {/* Fit-for-Hana card — fallback until profile system ships */}
            <FitForHanaCard profile={null} setupHref="#" />

            {/* Variant + add to bag + wishlist */}
            <Suspense
              fallback={
                <div className="space-y-6">
                  <Skeleton className="h-24 w-full rounded" />
                  <Skeleton className="h-12 w-full rounded" />
                </div>
              }
            >
              <PDPClient
                options={product.options ?? []}
                productId={product.id}
                productName={productName}
                productCategory={product.category?.slug ?? ''}
                price={price}
                locale={locale as Locale}
                isAuthenticated={!!user}
              />
            </Suspense>

            {/* About this piece — flat paragraph + spec table (M8) */}
            {productDescription && (
              <div className="pt-2">
                <p className="mb-2 text-[13px] font-semibold text-[var(--mz-ink)]">
                  {t('description')}
                </p>
                <p className="text-[13px] leading-[1.6] text-[var(--mz-ink-soft)] whitespace-pre-line">
                  {productDescription}
                </p>
              </div>
            )}

            {specRows.length > 0 && (
              <dl className="pt-2">
                {specRows.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between border-b border-[var(--mz-line)] py-[11px] text-[12.5px]"
                  >
                    <dt className="text-[var(--mz-ink-mute)]">{key}</dt>
                    <dd className="font-medium text-[var(--mz-ink)]">{value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {/* Shipping & returns — collapsible micro-rows */}
            <div className="pt-2">
              <details className="group border-t border-[var(--mz-line)]">
                <summary className="flex items-center justify-between cursor-pointer py-3 text-[12.5px] font-medium text-[var(--mz-ink)] list-none focus-visible:outline-none">
                  <span>{t('shipping')}</span>
                  <ChevronIcon />
                </summary>
                <p className="pb-3 text-[12.5px] leading-[1.6] text-[var(--mz-ink-soft)]">
                  {t('shippingContent')}
                </p>
              </details>
              <details className="group border-t border-[var(--mz-line)]">
                <summary className="flex items-center justify-between cursor-pointer py-3 text-[12.5px] font-medium text-[var(--mz-ink)] list-none focus-visible:outline-none">
                  <span>{t('returns')}</span>
                  <ChevronIcon />
                </summary>
                <p className="pb-3 text-[12.5px] leading-[1.6] text-[var(--mz-ink-soft)]">
                  {t('returnsContent')}
                </p>
              </details>
            </div>
          </div>
        </div>

        {/* Reviews section */}
        <ReviewSection
          productId={product.id}
          isAuthenticated={!!user}
          initialReviews={reviews.data}
          reviewStats={reviewStats}
          totalCount={reviews.total}
          avgRating={product.review_avg_rating}
          locale={locale as Locale}
        />

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section aria-label={t('relatedProducts')} className="mt-16">
            <div className="flex items-end justify-between mb-6">
              <h2 className="font-serif text-[24px] md:text-[28px] font-medium leading-[1.15] tracking-[-0.02em] text-[var(--mz-ink)]">
                {t('relatedProducts')}
              </h2>
              {product.category && (
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--mz-ink-mute)] hover:text-[var(--mz-ink)] transition-colors"
                >
                  {tCommon('viewAll')} →
                </Link>
              )}
            </div>
            <Suspense fallback={<ProductGridSkeleton count={4} />}>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    locale={locale as Locale}
                    isAuthenticated={!!user}
                  />
                ))}
              </div>
            </Suspense>
          </section>
        )}

        {/* Community posts featuring this product (F#8 reverse link) */}
        <RelatedCommunityPosts productId={product.id} locale={locale as Locale} />
      </Container>
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0 transition-transform duration-200 group-open:rotate-180 text-[var(--mz-ink-mute)]"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
