import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { routing, type Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProductBySlug, listProducts } from '@/lib/queries/products';
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
import { ProductGridSkeleton, Skeleton } from '@/components/ui/Skeleton';
import { PDPClient } from './_components/PDPClient';
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

  // Parallel fetch: reviews + review stats + related products
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

  return (
    <div className="bg-[var(--color-bg)] min-h-screen">
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
              <ol className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
                <li>
                  <Link
                    href="/"
                    className="hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    {tNav('home')}
                  </Link>
                </li>
                <li className="flex items-center gap-1">
                  <span aria-hidden="true">›</span>
                  <Link
                    href="/products"
                    className="hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    {tNav('shop')}
                  </Link>
                </li>
                <li className="flex items-center gap-1">
                  <span aria-hidden="true">›</span>
                  <span
                    className="text-[var(--color-text-primary)] font-medium"
                    aria-current="page"
                  >
                    {productName}
                  </span>
                </li>
              </ol>
            </nav>
          )}
        </div>

        {/* Main PDP layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 mb-16">
          {/* Left: Image gallery */}
          <div className="md:sticky md:top-24 md:self-start">
            <PDPImageGallery
              images={product.images.length > 0 ? product.images : [product.thumbnail_url]}
              productName={productName}
              productId={product.id}
            />
          </div>

          {/* Right: Product info */}
          <div className="space-y-6">
            {/* Category + badges */}
            <div className="flex items-center gap-2">
              {product.category && (
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-accent)] hover:text-[var(--color-brand-primary)] transition-colors"
                >
                  {getCategoryName(product.category, locale as Locale)}
                </Link>
              )}
              {product.is_featured && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]">
                  Featured
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] leading-tight">
              {productName}
            </h1>

            {/* Rating */}
            {product.review_count > 0 && (
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-0.5"
                  aria-label={`Rating: ${product.review_avg_rating.toFixed(1)} out of 5`}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} filled={i < Math.round(product.review_avg_rating)} />
                  ))}
                </div>
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {product.review_avg_rating.toFixed(1)}
                </span>
                <a
                  href="#reviews"
                  className="text-sm text-[var(--color-brand-secondary)] underline underline-offset-2 hover:text-[var(--color-brand-primary)] transition-colors"
                >
                  ({product.review_count})
                </a>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-[var(--color-text-primary)]">
                {formatPrice(price, locale as Locale)}
              </span>
            </div>

            {/* Variant selector + Add to cart + Wishlist */}
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

            {/* Product details accordion */}
            <div className="border-t border-[var(--color-border)] pt-6 space-y-4">
              {productDescription && (
                <details className="group" open>
                  <summary className="flex items-center justify-between cursor-pointer py-2 text-sm font-semibold text-[var(--color-text-primary)] list-none focus-visible:outline-none">
                    <span>{t('description')}</span>
                    <ChevronIcon />
                  </summary>
                  <p className="mt-3 text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
                    {productDescription}
                  </p>
                </details>
              )}

              {product.material && (
                <details className="group border-t border-[var(--color-border)] pt-4">
                  <summary className="flex items-center justify-between cursor-pointer py-2 text-sm font-semibold text-[var(--color-text-primary)] list-none focus-visible:outline-none">
                    <span>{t('details')}</span>
                    <ChevronIcon />
                  </summary>
                  <div className="mt-3 space-y-1 text-sm text-[var(--color-text-secondary)]">
                    <p>
                      {t('material')}: {product.material}
                    </p>
                    {product.care_instruction && (
                      <p>
                        {t('care')}: {product.care_instruction}
                      </p>
                    )}
                    {product.weight_g && (
                      <p>
                        {t('weight')}: {product.weight_g}g
                      </p>
                    )}
                  </div>
                </details>
              )}

              <details className="group border-t border-[var(--color-border)] pt-4">
                <summary className="flex items-center justify-between cursor-pointer py-2 text-sm font-semibold text-[var(--color-text-primary)] list-none focus-visible:outline-none">
                  <span>{t('shipping')}</span>
                  <ChevronIcon />
                </summary>
                <p className="mt-3 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {t('shippingContent')}
                </p>
              </details>

              <details className="group border-t border-[var(--color-border)] pt-4">
                <summary className="flex items-center justify-between cursor-pointer py-2 text-sm font-semibold text-[var(--color-text-primary)] list-none focus-visible:outline-none">
                  <span>{t('returns')}</span>
                  <ChevronIcon />
                </summary>
                <p className="mt-3 text-sm text-[var(--color-text-secondary)] leading-relaxed">
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
          <section aria-label={t('relatedProducts')}>
            <div className="flex items-end justify-between mb-6">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                {t('relatedProducts')}
              </h2>
              {product.category && (
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="text-sm text-[var(--color-brand-secondary)] hover:text-[var(--color-brand-primary)] underline-offset-2 hover:underline transition-colors"
                >
                  {tCommon('viewAll')}
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
      </Container>
    </div>
  );
}

function StarIcon({ filled, size = 14 }: { filled: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? '#F5A623' : 'none'}
      stroke={filled ? '#F5A623' : '#D1D5DB'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0 transition-transform duration-200 group-open:rotate-180"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
