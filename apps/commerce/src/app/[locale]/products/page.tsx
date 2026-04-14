/**
 * PLP — Product Listing Page
 * Strategy: SSR (no revalidate — dynamic filters)
 * Route: /[locale]/products
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { Container, Page } from '@/components/layout/Container';
import { ProductCard } from '@/components/product/ProductCard';
import { CategoryNav } from '@/components/product/CategoryNav';
import { ProductSort } from '@/components/product/ProductSort';
import { ProductFilterSidebar, ProductFilterDrawer } from '@/components/product/ProductFilter';
import { Pagination } from '@/components/product/Pagination';
import { PLPTracker } from '@/components/product/PLPTracker';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { listProducts } from '@/lib/queries/products';
import { listCategories } from '@/lib/queries/categories';
import { listSizes } from '@/lib/queries/sizes';
import { listAvailableColors } from '@/lib/queries/products';
import type { ProductListParams } from '@/lib/queries/products';

// ─── Types ────────────────────────────────────────────────────────────────────

type SearchParams = Promise<{
  category?: string;
  size?: string;
  color?: string;
  min_price?: string;
  max_price?: string;
  sort?: string;
  page?: string;
}>;

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: SearchParams;
};

const PER_PAGE = 20;
const VALID_SORTS = ['newest', 'price_asc', 'price_desc', 'popular'] as const;
type SortOption = (typeof VALID_SORTS)[number];

function parseSort(value: string | undefined): SortOption {
  return VALID_SORTS.includes(value as SortOption) ? (value as SortOption) : 'newest';
}

function parseList(value: string | undefined): string[] {
  return value ? value.split(',').filter(Boolean) : [];
}

function parsePageNum(value: string | undefined): number {
  const n = parseInt(value ?? '1', 10);
  return isNaN(n) || n < 1 ? 1 : n;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'plp' });
  return {
    title: t('title'),
    robots: { index: true, follow: true },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProductsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const sp = await searchParams;
  const category = sp.category ?? null;
  const sort = parseSort(sp.sort);
  const page = parsePageNum(sp.page);
  const sizes = parseList(sp.size);
  const colors = parseList(sp.color);
  const minPrice = sp.min_price ? parseInt(sp.min_price, 10) : undefined;
  const maxPrice = sp.max_price ? parseInt(sp.max_price, 10) : undefined;

  const t = await getTranslations({ locale, namespace: 'plp' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const tProduct = await getTranslations({ locale, namespace: 'product' });

  const queryParams: ProductListParams = {
    category_slug: category ?? undefined,
    sort,
    page,
    per_page: PER_PAGE,
    ...(sizes.length > 0 && { size_labels: sizes }),
    ...(colors.length > 0 && { colors }),
    ...(minPrice !== undefined && { min_price_krw: minPrice }),
    ...(maxPrice !== undefined && { max_price_krw: maxPrice }),
  };

  const [categoriesData, sizesData, colorsData, productsData] = await Promise.all([
    listCategories(),
    listSizes(),
    listAvailableColors(),
    listProducts(queryParams),
  ]);

  const { data: products, total } = productsData;
  const totalPages = Math.ceil(total / PER_PAGE);

  // Build category map for ProductCard
  const categoryMap = Object.fromEntries(categoriesData.map((c) => [c.id, c]));

  // Build href for pagination links
  function buildHref(targetPage: number): string {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (sort !== 'newest') params.set('sort', sort);
    if (sizes.length > 0) params.set('size', sizes.join(','));
    if (colors.length > 0) params.set('color', colors.join(','));
    if (sp.min_price) params.set('min_price', sp.min_price);
    if (sp.max_price) params.set('max_price', sp.max_price);
    if (targetPage > 1) params.set('page', String(targetPage));
    const qs = params.toString();
    return `/${locale}/products${qs ? `?${qs}` : ''}`;
  }

  const listName = category
    ? (categoriesData.find((c) => c.slug === category)?.name_en ?? 'Products')
    : 'All Products';

  const filterLabels = {
    filter: t('filterTitle'),
    size: t('size'),
    color: t('color'),
    price: t('price'),
    minPrice: t('minPrice'),
    maxPrice: t('maxPrice'),
    clearFilters: t('clearFilters'),
    apply: tCommon('apply'),
    showFilters: t('showFilters'),
    hideFilters: t('hideFilters'),
    close: tCommon('close'),
  };

  const activeFilters = {
    sizes,
    colors,
    minPrice: sp.min_price ?? '',
    maxPrice: sp.max_price ?? '',
  };

  const sortLabels = {
    sort: tCommon('sort'),
    newest: t('sortNewest'),
    priceAsc: t('sortPriceAsc'),
    priceDesc: t('sortPriceDesc'),
    popular: t('sortPopular'),
  };

  return (
    <Page>
      {/* Analytics: fires product_list_view on client */}
      <PLPTracker
        products={products}
        page={page}
        listName={listName}
        locale={locale as Locale}
      />

      <Container className="pt-6 pb-16 md:pt-8">
        {/* Page title */}
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">
          {t('title')}
        </h1>

        {/* Category tabs */}
        <div className="mb-6">
          <CategoryNav
            categories={categoriesData}
            currentCategory={category}
            allLabel={t('all')}
            locale={locale as Locale}
          />
        </div>

        {/* Toolbar: mobile filter + sort */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <ProductFilterDrawer
              sizes={sizesData}
              colors={colorsData}
              activeFilters={activeFilters}
              labels={filterLabels}
              listName={listName}
            />
            <p className="text-sm text-[var(--color-text-tertiary)] hidden sm:block">
              {t('results').replace('{count}', String(total))}
            </p>
          </div>
          <ProductSort currentSort={sort} labels={sortLabels} listName={listName} />
        </div>

        {/* Main layout: sidebar + grid */}
        <div className="flex gap-8 items-start">
          {/* Desktop filter sidebar */}
          <ProductFilterSidebar
            sizes={sizesData}
            colors={colorsData}
            activeFilters={activeFilters}
            labels={filterLabels}
            listName={listName}
          />

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {/* Result count (mobile) */}
            <p className="text-sm text-[var(--color-text-tertiary)] mb-4 sm:hidden">
              {t('results').replace('{count}', String(total))}
            </p>

            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-[var(--color-neutral-300)] mb-4"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
                <p className="text-base font-medium text-[var(--color-text-primary)]">
                  {t('noResults')}
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
                  {t('noResultsHint')}
                </p>
              </div>
            ) : (
              <ul
                className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-4 xl:grid-cols-4"
                aria-label={listName}
              >
                {products.map((product, index) => {
                  const cat = categoryMap[product.category_id];
                  if (!cat) return null;
                  return (
                    <li key={product.id}>
                      <ProductCard
                        product={product}
                        category={cat}
                        locale={locale as Locale}
                        position={(page - 1) * PER_PAGE + index + 1}
                        listName={listName}
                        newLabel={t('new')}
                        featuredLabel={t('featured')}
                        outOfStockLabel={tProduct('outOfStock')}
                      />
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Pagination */}
            <Pagination
              page={page}
              totalPages={totalPages}
              buildHref={buildHref}
              labels={{
                prev: t('prevPage'),
                next: t('nextPage'),
                pageOf: t('pageOf'),
              }}
            />
          </div>
        </div>
      </Container>
    </Page>
  );
}

