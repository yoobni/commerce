/**
 * Search Results Page
 * Strategy: SSR (dynamic — query changes on every request)
 * Route: /[locale]/search?q=...&sort=...&page=...
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { Container, Page } from '@/components/layout/Container';
import { ProductCard } from '@/components/product/ProductCard';
import { Pagination } from '@/components/product/Pagination';
import { SearchTracker } from '@/components/product/SearchTracker';
import { SearchSort } from '@/components/search/SearchSort';
import { searchProducts } from '@/lib/queries/search';
import { listCategories } from '@/lib/queries/categories';
import type { SearchProductsParams } from '@commerce/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type SearchPageSearchParams = Promise<{
  q?: string;
  sort?: string;
  page?: string;
}>;

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: SearchPageSearchParams;
};

const PER_PAGE = 20;
const VALID_SORTS = ['relevance', 'newest', 'price_asc', 'price_desc', 'popular'] as const;
type SearchSortOption = (typeof VALID_SORTS)[number];

function parseSort(value: string | undefined): SearchSortOption {
  return VALID_SORTS.includes(value as SearchSortOption) ? (value as SearchSortOption) : 'relevance';
}

function parsePageNum(value: string | undefined): number {
  const n = parseInt(value ?? '1', 10);
  return isNaN(n) || n < 1 ? 1 : n;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: 'search' });
  const query = sp.q?.trim() ?? '';
  return {
    title: query ? t('metaTitleWithQuery', { query }) : t('metaTitle'),
    robots: { index: false, follow: true },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const sp = await searchParams;
  const query = sp.q?.trim() ?? '';
  const sort = parseSort(sp.sort);
  const page = parsePageNum(sp.page);

  const t = await getTranslations({ locale, namespace: 'search' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const tProduct = await getTranslations({ locale, namespace: 'product' });
  const tEmpty = await getTranslations({ locale, namespace: 'empty' });
  const tPlp = await getTranslations({ locale, namespace: 'plp' });

  const queryParams: SearchProductsParams = {
    query,
    locale: locale as Locale,
    sort,
    page,
    per_page: PER_PAGE,
  };

  const [categoriesData, productsData] = await Promise.all([
    listCategories(),
    query
      ? searchProducts(queryParams)
      : Promise.resolve({ data: [], total: 0, page, per_page: PER_PAGE, has_next: false }),
  ]);

  const { data: products, total } = productsData;
  const totalPages = Math.ceil(total / PER_PAGE);
  const categoryMap = Object.fromEntries(categoriesData.map((c) => [c.id, c]));

  function buildHref(targetPage: number): string {
    const p = new URLSearchParams();
    if (query) p.set('q', query);
    if (sort !== 'relevance') p.set('sort', sort);
    if (targetPage > 1) p.set('page', String(targetPage));
    const qs = p.toString();
    return `/${locale}/search${qs ? `?${qs}` : ''}`;
  }

  const sortLabels = {
    sort: tCommon('sort'),
    relevance: t('sortRelevance'),
    newest: tPlp('sortNewest'),
    priceAsc: tPlp('sortPriceAsc'),
    priceDesc: tPlp('sortPriceDesc'),
    popular: tPlp('sortPopular'),
  };

  return (
    <Page>
      {/* Analytics */}
      {query && (
        <SearchTracker
          query={query}
          products={products}
          locale={locale as Locale}
        />
      )}

      <Container className="pt-6 pb-16 md:pt-8">
        {/* Page title */}
        <div className="flex flex-col gap-1 mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            {query ? t('resultsTitle', { query }) : t('title')}
          </h1>
          {query && (
            <p className="text-sm text-[var(--color-text-tertiary)]">
              {t('resultCount', { count: String(total) })}
            </p>
          )}
        </div>

        {/* No query state */}
        {!query && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
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
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <p className="text-base font-medium text-[var(--color-text-secondary)]">
              {t('placeholder')}
            </p>
          </div>
        )}

        {/* Results */}
        {query && (
          <>
            {/* Sort toolbar */}
            {products.length > 0 && (
              <div className="flex justify-end mb-4">
                <SearchSort currentSort={sort} labels={sortLabels} />
              </div>
            )}

            {/* Empty state */}
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
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <p className="text-base font-medium text-[var(--color-text-primary)]">
                  {tEmpty('search.title')}
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
                  {tEmpty('search.description')}
                </p>
                <a
                  href={`/${locale}/products`}
                  className="mt-4 text-sm font-medium text-[var(--color-accent)] hover:underline"
                >
                  {tEmpty('search.action')}
                </a>
              </div>
            ) : (
              <ul
                className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-4 xl:grid-cols-4"
                aria-label={t('resultsTitle', { query })}
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
                        listName={`Search: ${query}`}
                        newLabel={tPlp('new')}
                        featuredLabel={tPlp('featured')}
                        outOfStockLabel={tProduct('outOfStock')}
                      />
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Pagination */}
            {products.length > 0 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                buildHref={buildHref}
                labels={{
                  prev: tPlp('prevPage'),
                  next: tPlp('nextPage'),
                  pageOf: tPlp('pageOf'),
                }}
              />
            )}
          </>
        )}
      </Container>
    </Page>
  );
}
