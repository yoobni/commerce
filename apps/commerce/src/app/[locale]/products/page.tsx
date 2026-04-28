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
import { cn } from '@/lib/cn';
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

  const currentSort: SortOption = (
    ['newest', 'price_asc', 'price_desc', 'popular'] as SortOption[]
  ).includes(sp.sort as SortOption)
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
  const hasActiveFilters = !!(
    currentCategory ||
    currentSizes.length > 0 ||
    currentColors.length > 0 ||
    currentMinPrice ||
    currentMaxPrice
  );

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
    Object.entries(merged).forEach(([k, v]) => {
      if (v) p.set(k, v);
    });
    const qs = p.toString();
    return `/products${qs ? `?${qs}` : ''}`;
  }

  return (
    <div className="bg-[var(--mz-bg)] min-h-screen">
      {/* ── Mobile: sticky horizontal Chip filter strip ─────────────────── */}
      {/* Direction B spec: "Sticky filter strip: Fit chip active → sort/color/price chips" */}
      <div className="lg:hidden sticky top-14 z-20 bg-[var(--mz-surface)] border-b border-[var(--mz-line)]">
        <div
          className="flex items-center gap-2 overflow-x-auto scrollbar-none [-webkit-overflow-scrolling:touch] px-5 py-3"
          role="group"
          aria-label="Product filters"
        >
          {/* All */}
          <Link
            href={buildUrl({ category: undefined })}
            className={chipClass(!currentCategory && !featuredOnly)}
            aria-current={!currentCategory && !featuredOnly ? 'true' : undefined}
          >
            {t('all')}
          </Link>

          {/* Category chips */}
          {categories
            .filter((c) => !c.parent_id)
            .map((cat) => (
              <Link
                key={cat.id}
                href={buildUrl({ category: cat.slug })}
                className={chipClass(currentCategory === cat.slug)}
                aria-current={currentCategory === cat.slug ? 'true' : undefined}
              >
                {getCategoryName(cat, locale as Locale)}
              </Link>
            ))}

          {/* Size chips */}
          {SIZE_OPTIONS.map((size) => {
            const active = currentSizes.includes(size);
            const newSizes = active
              ? currentSizes.filter((s) => s !== size)
              : [...currentSizes, size];
            return (
              <Link
                key={size}
                href={buildUrl({ size: newSizes.join(',') || undefined })}
                className={chipClass(active)}
                aria-current={active ? 'true' : undefined}
              >
                {size}
              </Link>
            );
          })}

          {/* Clear — only when active filters */}
          {hasActiveFilters && (
            <Link
              href="/products"
              className="shrink-0 text-[11px] font-medium text-[var(--mz-accent)] underline underline-offset-2 px-1 whitespace-nowrap"
            >
              {t('clearFilters')}
            </Link>
          )}
        </div>
      </div>

      <Container className="py-8 md:py-12">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="font-serif text-[26px] md:text-[32px] font-[500] leading-[1.15] tracking-[-0.02em] text-[var(--mz-ink)]">
            {currentCategory
              ? categories.find((c) => c.slug === currentCategory)
                ? getCategoryName(
                    categories.find((c) => c.slug === currentCategory)!,
                    locale as Locale
                  )
                : t('title')
              : t('title')}
          </h1>
          {result.total > 0 && (
            <p className="text-[12px] text-[var(--mz-ink-mute)] mt-1.5">
              {t('results', { count: result.total })}
            </p>
          )}
        </div>

        <div className="flex gap-8">
          {/* ── Desktop sidebar filters ──────────────────────────────── */}
          <aside className="hidden lg:block w-52 shrink-0 space-y-7">
            {/* Categories */}
            <div>
              <h3 className="text-eyebrow text-[var(--mz-ink-mute)] mb-3">Category</h3>
              <ul className="space-y-0.5">
                <li>
                  <Link
                    href={buildUrl({ category: undefined, page: undefined })}
                    className={sidebarLinkClass(!currentCategory)}
                  >
                    {t('all')}
                  </Link>
                </li>
                {categories
                  .filter((c) => !c.parent_id)
                  .map((cat) => (
                    <li key={cat.id}>
                      <Link
                        href={buildUrl({ category: cat.slug, page: undefined })}
                        className={sidebarLinkClass(currentCategory === cat.slug)}
                      >
                        {getCategoryName(cat, locale as Locale)}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>

            {/* Size filter */}
            <div>
              <h3 className="text-eyebrow text-[var(--mz-ink-mute)] mb-3">{t('size')}</h3>
              <div className="flex flex-wrap gap-1.5">
                {SIZE_OPTIONS.map((size) => {
                  const active = currentSizes.includes(size);
                  const newSizes = active
                    ? currentSizes.filter((s) => s !== size)
                    : [...currentSizes, size];
                  return (
                    <Link
                      key={size}
                      href={buildUrl({ size: newSizes.join(',') || undefined, page: undefined })}
                      className={cn(
                        'inline-flex items-center justify-center min-w-[44px] h-9 px-2.5 rounded-[var(--radius-md)] border text-[12px] font-medium transition-colors duration-150',
                        active
                          ? 'bg-[var(--mz-ink)] text-[var(--mz-bg)] border-[var(--mz-ink)]'
                          : 'bg-[var(--mz-surface)] text-[var(--mz-ink)] border-[var(--mz-line-strong)] hover:border-[var(--mz-ink)]'
                      )}
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
                <h3 className="text-eyebrow text-[var(--mz-ink-mute)] mb-3">{t('color')}</h3>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map(({ name, hex }) => {
                    const active = currentColors.includes(name);
                    const newColors = active
                      ? currentColors.filter((c) => c !== name)
                      : [...currentColors, name];
                    return (
                      <Link
                        key={name}
                        href={buildUrl({
                          color: newColors.join(',') || undefined,
                          page: undefined,
                        })}
                        aria-label={name}
                        aria-pressed={active}
                        className={cn(
                          'w-7 h-7 rounded-full border-2 transition-all duration-150',
                          active
                            ? 'border-[var(--mz-ink)] scale-110'
                            : 'border-[var(--mz-line)] hover:scale-105 hover:border-[var(--mz-ink-mute)]'
                        )}
                        style={{ backgroundColor: hex }}
                        title={name}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Clear filters */}
            {hasActiveFilters && (
              <Link
                href="/products"
                className="text-[12px] font-medium text-[var(--mz-accent)] hover:underline underline-offset-2 block"
              >
                {t('clearFilters')}
              </Link>
            )}
          </aside>

          {/* ── Main content ──────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Sort bar */}
            <div className="flex items-center justify-between mb-6 gap-3">
              <span className="text-[12px] text-[var(--mz-ink-mute)] lg:hidden">
                {result.total > 0 ? t('results', { count: result.total }) : ''}
              </span>

              <div className="flex items-center gap-2 ml-auto">
                <label
                  htmlFor="sort-select"
                  className="text-[12px] text-[var(--mz-ink-mute)] shrink-0"
                >
                  {t('sort') ?? 'Sort'}:
                </label>
                <div className="relative">
                  <select
                    id="sort-select"
                    defaultValue={currentSort}
                    className="appearance-none h-9 pl-3 pr-8 rounded-[var(--radius-md)] border border-[var(--mz-line-strong)] bg-[var(--mz-surface)] text-[12px] text-[var(--mz-ink)] focus:outline-none focus:border-[var(--mz-ink)] cursor-pointer transition-colors duration-150"
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
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--mz-ink-mute)]">
                    <ChevronIcon />
                  </span>
                </div>
              </div>
            </div>

            {/* Product grid */}
            {result.data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div
                  className="w-12 h-12 rounded-full bg-[var(--mz-bg-deep)] flex items-center justify-center mb-4"
                  aria-hidden="true"
                >
                  <PawIcon />
                </div>
                <p className="text-[var(--mz-ink)] font-medium text-[14px] mb-1">
                  {t('noResults')}
                </p>
                <p className="text-[12px] text-[var(--mz-ink-mute)] mb-6">{t('noResultsHint')}</p>
                <Link
                  href="/products"
                  className="text-[12px] text-[var(--mz-accent)] hover:underline underline-offset-2"
                >
                  {t('clearFilters')}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
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
                    className="h-10 px-4 rounded-[var(--radius-md)] border border-[var(--mz-line-strong)] text-[12px] font-medium text-[var(--mz-ink)] hover:bg-[var(--mz-bg-deep)] transition-colors"
                  >
                    {t('prevPage')}
                  </Link>
                )}
                <span className="text-[12px] text-[var(--mz-ink-mute)]">
                  {t('pageOf', { page: currentPage, total: totalPages })}
                </span>
                {currentPage < totalPages && (
                  <Link
                    href={buildUrl({ page: String(currentPage + 1) })}
                    className="h-10 px-4 rounded-[var(--radius-md)] border border-[var(--mz-line-strong)] text-[12px] font-medium text-[var(--mz-ink)] hover:bg-[var(--mz-bg-deep)] transition-colors"
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

// ── Chip class helper (server-side link chips) ────────────────────────────────

function chipClass(selected: boolean): string {
  return cn(
    'shrink-0 inline-flex items-center px-3.5 py-[7px]',
    'rounded-full text-[12px] font-medium border',
    'whitespace-nowrap transition-colors duration-150',
    selected
      ? 'bg-[var(--mz-ink)] border-[var(--mz-ink)] text-[var(--mz-bg)]'
      : 'bg-[var(--mz-surface)] border-[var(--mz-line-strong)] text-[var(--mz-ink)] hover:border-[var(--mz-ink)]'
  );
}

// ── Sidebar link class helper ─────────────────────────────────────────────────

function sidebarLinkClass(active: boolean): string {
  return cn(
    'block text-[13px] py-1.5 px-2.5 rounded-[var(--radius-sm)] transition-colors duration-150',
    active
      ? 'font-semibold text-[var(--mz-ink)] bg-[var(--mz-bg-deep)]'
      : 'text-[var(--mz-ink-soft)] hover:text-[var(--mz-ink)] hover:bg-[var(--mz-bg-deep)]'
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function ChevronIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function PawIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-[var(--mz-ink-mute)]"
      aria-hidden="true"
    >
      <circle cx="12" cy="16" r="5" />
      <circle cx="6" cy="9" r="2.5" />
      <circle cx="12" cy="7" r="2.5" />
      <circle cx="18" cy="9" r="2.5" />
    </svg>
  );
}
