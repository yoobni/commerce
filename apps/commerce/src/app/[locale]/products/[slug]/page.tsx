/**
 * PDP — Product Detail Page
 * Strategy: SSR (dynamic, no revalidate — real-time stock & options)
 * Route: /[locale]/products/[slug]
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { hasLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { Container, Page } from '@/components/layout/Container';
import { ProductCard } from '@/components/product/ProductCard';
import { PDPGallery } from '@/components/product/PDPGallery';
import { PDPOptions } from '@/components/product/PDPOptions';
import { PDPTracker } from '@/components/product/PDPTracker';
import { getProductBySlug, listProducts } from '@/lib/queries/products';
import { listCategories } from '@/lib/queries/categories';
import { listSizes } from '@/lib/queries/sizes';
import { getProductName, getCategoryName, formatPrice } from '@/lib/format';
import type { Category } from '@commerce/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCategoryPath(categories: Category[], categoryId: string): Category[] {
  const cat = categories.find((c) => c.id === categoryId);
  if (!cat) return [];
  if (!cat.parent_id) return [cat];
  const parent = categories.find((c) => c.id === cat.parent_id);
  return parent ? [parent, cat] : [cat];
}

function getDescriptionByLocale(
  product: Awaited<ReturnType<typeof getProductBySlug>>,
  locale: string
): string {
  if (!product) return '';
  switch (locale) {
    case 'ko': return product.description_ko;
    case 'en': return product.description_en;
    case 'ja': return product.description_ja;
    case 'de': return product.description_de;
    default:   return product.description_en;
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const product = await getProductBySlug(slug);
  if (!product) return {};

  const name = getProductName(product, locale as Locale);
  const description = getDescriptionByLocale(product, locale);

  return {
    title: name,
    description: description.slice(0, 155),
    openGraph: {
      images: [{ url: product.thumbnail_url, width: 800, height: 800 }],
    },
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}/products/${slug}`])
      ),
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProductDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const [product, categories, sizes] = await Promise.all([
    getProductBySlug(slug),
    listCategories(),
    listSizes(),
  ]);

  if (!product || product.status === 'HIDDEN' || product.status === 'DISCONTINUED') {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'product' });
  const tPdp = await getTranslations({ locale, namespace: 'pdp' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  const castedLocale = locale as Locale;
  const name = getProductName(product, castedLocale);
  const price = formatPrice(product, castedLocale);
  const description = getDescriptionByLocale(product, locale);
  const categoryPath = getCategoryPath(categories, product.category_id);
  const lastCategory = categoryPath[categoryPath.length - 1];

  // Related products (same category, excluding current)
  const relatedResult = await listProducts({
    category_slug: product.category?.slug,
    per_page: 5,
    status: 'ACTIVE',
  });
  const relatedProducts = relatedResult.data
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  // ── Options labels ─────────────────────────────────────────────────────────
  const optionLabels = {
    selectColor: tPdp('selectColor'),
    selectSize: t('selectSize'),
    sizeGuide: t('sizeGuide'),
    addToCart: t('addToCart'),
    addingToCart: tPdp('addingToCart'),
    addToWishlist: t('addToWishlist'),
    removeFromWishlist: tPdp('removeFromWishlist'),
    outOfStock: t('outOfStock'),
    inStock: tPdp('inStock'),
    lowStock: tPdp('lowStock'),
    selectOptionFirst: tPdp('selectOptionFirst'),
    errorAddToCart: tPdp('errorAddToCart'),
    loginRequired: tPdp('loginRequired'),
    sizeGuideTitle: tPdp('sizeGuideTitle'),
    sizeLabel: tPdp('sizeLabel'),
    chest: tPdp('chest'),
    backLength: tPdp('backLength'),
    neck: tPdp('neck'),
    weight: tPdp('weight'),
    breedExamples: tPdp('breedExamples'),
    close: tCommon('close'),
  };

  return (
    <Page>
      {/* Analytics tracker — fires product_detail_view on client */}
      <PDPTracker
        productId={product.id}
        productName={name}
        price={product.base_price_krw}
        category={product.category?.slug ?? ''}
        locale={castedLocale}
      />

      <Container className="pt-6 pb-16 md:pt-8">
        {/* ── Breadcrumb — 2depth category nav ──────────────────────── */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-1.5 text-sm text-[var(--color-text-tertiary)] flex-wrap">
            <li>
              <Link
                href={`/${locale}`}
                className="hover:text-[var(--color-text-primary)] transition-colors"
              >
                {tPdp('breadcrumbHome')}
              </Link>
            </li>
            {categoryPath.map((cat) => (
              <li key={cat.id} className="flex items-center gap-1.5">
                <ChevronRightIcon />
                <Link
                  href={`/${locale}/products?category=${cat.slug}`}
                  className="hover:text-[var(--color-text-primary)] transition-colors"
                >
                  {getCategoryName(cat, castedLocale)}
                </Link>
              </li>
            ))}
            <li className="flex items-center gap-1.5 min-w-0">
              <ChevronRightIcon />
              <span
                className="text-[var(--color-text-primary)] font-medium truncate max-w-[180px] sm:max-w-xs"
                aria-current="page"
              >
                {name}
              </span>
            </li>
          </ol>
        </nav>

        {/* ── Main product section ────────────────────────────────────── */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 xl:gap-16">
          {/* Left: Gallery */}
          <PDPGallery
            images={
              product.images.length > 0
                ? product.images
                : [product.thumbnail_url]
            }
            productName={name}
            productId={product.id}
          />

          {/* Right: Info + Options */}
          <div className="mt-8 lg:mt-0">
            {/* Category label */}
            {lastCategory && (
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-2">
                {getCategoryName(lastCategory, castedLocale)}
              </p>
            )}

            {/* Product name */}
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] leading-tight">
              {name}
            </h1>

            {/* Rating */}
            {product.review_count > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <StarRating rating={product.review_avg_rating} />
                <a
                  href="#reviews"
                  className="text-sm text-[var(--color-text-tertiary)] hover:underline underline-offset-2"
                >
                  ({product.review_count} {t('reviews')})
                </a>
              </div>
            )}

            {/* Price */}
            <p className="mt-4 text-2xl font-semibold text-[var(--color-text-primary)] tabular-nums">
              {price}
            </p>

            {/* Options: color / size / cart / wishlist */}
            <div className="mt-6">
              <PDPOptions
                product={product}
                options={product.options}
                sizes={sizes}
                locale={castedLocale}
                labels={optionLabels}
              />
            </div>

            {/* Description */}
            <div className="mt-8 pt-8 border-t border-[var(--color-border)]">
              <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-3">
                {t('description')}
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>

            {/* Details */}
            {(product.material || product.care_instruction) && (
              <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
                <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-3">
                  {t('details')}
                </h2>
                <dl className="space-y-2 text-sm">
                  {product.material && (
                    <div className="flex gap-4">
                      <dt className="text-[var(--color-text-tertiary)] w-28 shrink-0">
                        {tPdp('material')}
                      </dt>
                      <dd className="text-[var(--color-text-secondary)]">{product.material}</dd>
                    </div>
                  )}
                  {product.care_instruction && (
                    <div className="flex gap-4">
                      <dt className="text-[var(--color-text-tertiary)] w-28 shrink-0">
                        {tPdp('careInstruction')}
                      </dt>
                      <dd className="text-[var(--color-text-secondary)]">
                        {product.care_instruction}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>
        </div>

        {/* ── Related products ────────────────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <section
            id="related"
            className="mt-16 pt-12 border-t border-[var(--color-border)]"
            aria-label={t('relatedProducts')}
          >
            <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-6">
              {t('relatedProducts')}
            </h2>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 md:gap-x-4">
              {relatedProducts.map((related, index) => {
                const cat = categoryMap[related.category_id];
                if (!cat) return null;
                return (
                  <li key={related.id}>
                    <ProductCard
                      product={related}
                      category={cat}
                      locale={castedLocale}
                      position={index + 1}
                      listName="related_products"
                      newLabel={t('new')}
                      featuredLabel={t('featured')}
                      outOfStockLabel={t('outOfStock')}
                    />
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </Container>
    </Page>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`Rating: ${rating} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={
            i < full
              ? 'currentColor'
              : i === full && half
                ? 'url(#pdp-star-half)'
                : 'none'
          }
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-[var(--color-brand-accent)]"
          aria-hidden="true"
        >
          {i === full && half && (
            <defs>
              <linearGradient id="pdp-star-half">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
          )}
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
