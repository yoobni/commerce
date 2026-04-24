import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { listProducts } from '@/lib/queries/products';
import { listCategories } from '@/lib/queries/categories';
import { listAvailableColors } from '@/lib/queries/products';
import { ProductCard } from '@/components/product/ProductCard';
import { Container } from '@/components/layout/Container';
import { Link } from '@/i18n/navigation';
import { getCategoryName } from '@/lib/format';
import type { ProductListParams } from '@/lib/queries/products';

// SSR — dynamic filters
export const dynamic = 'force-dynamic';

type SortOption = NonNullable<ProductListParams['sort']>;

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    category?: string;
    sort?: string;
    size?: string | string[];
    color?: string | string[];
    min_price?: string;
    max_price?: string;
    page?: string;
    featured?: string;
  }>;
};

const SORT_OPTIONS: { value: SortOption; labelKey: string }[] = [
  { value: 'newest', labelKey: 'sortNewest' },
  { value: 'price_asc', labelKey: 'sortPriceAsc' },
  { value: 'price_desc', labelKey: 'sortPriceDesc' },
  { value: 'popular', labelKey: 'sortPopular' },
];

const SIZE_OPTIONS = ['S', 'M', 'L', 'XL', '2XL', '3XL'];
const PER_PAGE = 24;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'plp' });
  return { title: t('title') };
}

export default async function ProductsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const sp = await searchParams;

  const currentSort: SortOption = (['newest', 'price_asc', 'price_desc', 'popular'] as SortOption[]).includes(sp.sort as SortOption)
    ? (sp.sort as SortOption)
    : 'newest';
  const currentCategory = sp.category ?? '';
  const currentSizes = sp.size ? (Array.isArray(sp.size) ? sp.size : [sp.size]) : [];
  const currentColors = sp.color ? (Array.isArray(sp.color) ? sp.color : [sp.color]) : [];
  const currentMinPrice = sp.min_price ? parseInt(sp.min_price, 10) : undefined;
  const currentMaxPrice = sp.max_price ? parseInt(sp.max_price, 10) : undefined;
  const currentPage = Math.max(1, parseInt(sp.page ?? '1', 10));
  const featuredOnly = sp.featured === 'true';

  const t = await getTranslations({ locale, namespace: 'plp' });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [categories, availableColors, result] = await Promise.all([
    listCategories(true),
    listAvailableColors(),
    listProducts({
      category_slug: currentCategory || undefined,
      sort: currentSort,
      size_labels: currentSizes.length > 0 ? currentSizes : undefined,
      colors: currentColors.length > 0 ? currentColors : undefined,
      min_price_krw: currentMinPrice,
      max_price_krw: currentMaxPrice,
      featured: featuredOnly || undefined,
      page: currentPage,
      per_page: PER_PAGE,
    }),
  ]);

  const totalPages = Math.ceil(result.total / PER_PAGE);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const merged: Record<string, string | undefined> = {
      category: currentCategory || undefined,
      sort: currentSort !== 'newest' ? currentSort : undefined,
      size: currentSizes.join(',') || undefined,
      color: currentColors.join(',') || undefined,
      min_price: currentMinPrice?.toString(),
      max_price: currentMaxPrice?.toString(),
      page: undefined,
      ...overrides,
    };
    const p = new URLSearchParams();
    Object.entries(merged).forEach(([k, v]) => { if (v) p.set(k, v); });
    const qs = p.toString();
    return `/products${qs ? `?${qs}` : ''}`;
  }

  return (
    <div className="bg-[var(--color-bg)] min-h-screen">
      <Container className="py-8 md:py-12">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)]">
            {currentCategory
              ? (categories.find((c) => c.slug === currentCategory)
                  ? getCategoryName(categories.find((c) => c.slug === currentCategory)!, locale as Locale)
                  : t('title'))
              : t('title')}
          </h1>
          {result.total > 0 && (
            <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
              {t('results', { count: result.total })}
            </p>
          )}
        </div>

        <div className="flex gap-8">
          {/* Sidebar filters — desktop */}
          <aside className="hidden lg:block w-56 shrink-0 space-y-7">
            {/* Categories */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-3">
                {t('title')}
              </h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    href={buildUrl({ category: undefined, page: undefined })}
                    className={`block text-sm py-1.5 px-2 rounded transition-colors ${
                      !currentCategory
                        ? 'font-semibold text-[var(--color-brand-primary)] bg-[var(--color-neutral-100)]'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-neutral-50)]'
                    }`}
                  >
                    {t('all')}
                  </Link>
                </li>
                {categories.filter((c) => !c.parent_id).map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={buildUrl({ category: cat.slug, page: undefined })}
                      className={`block text-sm py-1.5 px-2 rounded transition-colors ${
                        currentCategory === cat.slug
                          ? 'font-semibold text-[var(--color-brand-primary)] bg-[var(--color-neutral-100)]'
                          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-neutral-50)]'
                      }`}
                    >
                      {getCategoryName(cat, locale as Locale)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Size filter */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-3">
                {t('size')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {SIZE_OPTIONS.map((size) => {
                  const active = currentSizes.includes(size);
                  const newSizes = active
                    ? currentSizes.filter((s) => s !== size)
                    : [...currentSizes, size];
                  return (
                    <Link
                      key={size}
                      href={buildUrl({ size: newSizes.join(',') || undefined, page: undefined })}
                      className={`inline-flex items-center justify-center min-w-[44px] h-9 px-2.5 rounded border text-sm font-medium transition-colors ${
                        active
                          ? 'bg-[var(--color-brand-primary)] text-white border-[var(--color-brand-primary)]'
                          : 'bg-white text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-brand-primary)]'
                      }`}
                    >
                      {size}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Color filter */}
            {availableColors.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-3">
                  {t('color')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map(({ name, hex }) => {
                    const active = currentColors.includes(name);
                    const newColors = active
                      ? currentColors.filter((c) => c !== name)
                      : [...currentColors, name];
                    return (
                      <Link
                        key={name}
                        href={buildUrl({ color: newColors.join(',') || undefined, page: undefined })}
                        aria-label={name}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${
                          active ? 'border-[var(--color-brand-primary)] scale-110' : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: hex }}
                        title={name}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Clear filters */}
            {(currentCategory || currentSizes.length > 0 || currentColors.length > 0 || currentMinPrice || currentMaxPrice) && (
              <Link
                href="/products"
                className="text-sm text-[var(--color-brand-accent)] hover:underline underline-offset-2"
              >
                {t('clearFilters')}
              </Link>
            )}
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Sort + mobile filter bar */}
            <div className="flex items-center justify-between mb-6 gap-3">
              {/* Mobile: show filter count */}
              <div className="flex items-center gap-2 lg:hidden">
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {result.total > 0 ? t('results', { count: result.total }) : ''}
                </span>
              </div>

              {/* Sort select */}
              <div className="flex items-center gap-2 ml-auto">
                <label htmlFor="sort-select" className="text-sm text-[var(--color-text-secondary)] shrink-0">
                  {t('sort') ?? 'Sort'}:
                </label>
                <div className="relative">
                  <select
                    id="sort-select"
                    defaultValue={currentSort}
                    className="appearance-none h-9 pl-3 pr-8 rounded border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-primary)] cursor-pointer"
                    onChange={(e) => {
                      window.location.href = buildUrl({ sort: e.target.value, page: undefined });
                    }}
                  >
                    {SORT_OPTIONS.map(({ value, labelKey }) => (
                      <option key={value} value={value}>
                        {t(labelKey)}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
                    <ChevronIcon />
                  </span>
                </div>
              </div>
            </div>

            {/* Product grid */}
            {result.data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-4xl mb-4">🐾</p>
                <p className="text-[var(--color-text-primary)] font-medium mb-1">{t('noResults')}</p>
                <p className="text-sm text-[var(--color-text-secondary)] mb-6">{t('noResultsHint')}</p>
                <Link
                  href="/products"
                  className="text-sm text-[var(--color-brand-accent)] hover:underline underline-offset-2"
                >
                  {t('clearFilters')}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {result.data.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    locale={locale as Locale}
                    isAuthenticated={!!user}
                    priority={i < 6}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-12">
                {currentPage > 1 && (
                  <Link
                    href={buildUrl({ page: String(currentPage - 1) })}
                    className="h-10 px-4 rounded border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-neutral-50)] transition-colors"
                  >
                    {t('prevPage')}
                  </Link>
                )}
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {t('pageOf', { page: currentPage, total: totalPages })}
                </span>
                {currentPage < totalPages && (
                  <Link
                    href={buildUrl({ page: String(currentPage + 1) })}
                    className="h-10 px-4 rounded border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-neutral-50)] transition-colors"
                  >
                    {t('nextPage')}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
