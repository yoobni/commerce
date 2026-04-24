import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { listProducts } from '@/lib/queries/products';
import { listCategories } from '@/lib/queries/categories';
import { listAvailableColors } from '@/lib/queries/products';
import { listSizes } from '@/lib/queries/sizes';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { Container } from '@/components/layout/Container';
import { FiltersPanel } from './_components/FiltersPanel';
import type { SizeLabel } from '@commerce/types';

// SSR — dynamic filters, full SEO
export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    category?: string;
    sort?: string;
    sizes?: string;
    colors?: string;
    min_price?: string;
    max_price?: string;
    page?: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'plp' });
  return { title: t('title') };
}

const VALID_SORTS = ['newest', 'price_asc', 'price_desc', 'popular'] as const;
type SortOption = (typeof VALID_SORTS)[number];
const PER_PAGE = 20;

export default async function ProductsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const sp = await searchParams;

  const sort: SortOption = VALID_SORTS.includes(sp.sort as SortOption)
    ? (sp.sort as SortOption)
    : 'newest';
  const category = sp.category ?? '';
  const sizeLabels = sp.sizes?.split(',').filter(Boolean) ?? [];
  const colorNames = sp.colors?.split(',').filter(Boolean) ?? [];
  const minPrice = sp.min_price ? parseInt(sp.min_price, 10) : undefined;
  const maxPrice = sp.max_price ? parseInt(sp.max_price, 10) : undefined;
  const page = Math.max(1, parseInt(sp.page ?? '1', 10));

  const t = await getTranslations({ locale, namespace: 'plp' });

  // ── Parallel data fetch ──
  const [result, categories, colors, sizes] = await Promise.all([
    listProducts({
      sort,
      page,
      per_page: PER_PAGE,
      category_slug: category || undefined,
      size_labels: sizeLabels.length > 0 ? sizeLabels : undefined,
      colors: colorNames.length > 0 ? colorNames : undefined,
      min_price_krw: minPrice,
      max_price_krw: maxPrice,
    }),
    listCategories(true),
    listAvailableColors(),
    listSizes(),
  ]);

  const availableSizeLabels = sizes.map((s) => s.label) as SizeLabel[];
  const { data: products, total } = result;
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <Container className="py-8 md:py-12">

        {/* ── Page header ── */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            {category
              ? getCategoryDisplayName(categories, category, locale as Locale)
              : t('title')}
          </h1>
          {total > 0 && (
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              {t('results', { count: total })}
            </p>
          )}
        </div>

        {/* ── Layout: sidebar (md+) + grid ── */}
        <div className="flex flex-col gap-6 md:flex-row md:gap-8">

          {/* Sidebar filters */}
          <aside className="w-full md:w-56 md:shrink-0">
            <FiltersPanel
              categories={categories}
              sizes={availableSizeLabels}
              colors={colors}
              locale={locale}
            />
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-base font-semibold text-[var(--color-text-primary)]">
                  {t('noResults')}
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  {t('noResultsHint')}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      locale={locale as Locale}
                      priority={i < 4}
                    />
                  ))}
                </div>

                {/* ── Pagination ── */}
                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-3">
                    {page > 1 && (
                      <PaginationLink
                        href={buildPageHref(sp, page - 1)}
                        label={t('prevPage')}
                      />
                    )}
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      {t('pageOf', { page, total: totalPages })}
                    </span>
                    {page < totalPages && (
                      <PaginationLink
                        href={buildPageHref(sp, page + 1)}
                        label={t('nextPage')}
                      />
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Container>
    </main>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

import type { Category } from '@commerce/types';

function getCategoryDisplayName(
  categories: Category[],
  slug: string,
  locale: Locale
): string {
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return slug;
  const map: Record<Locale, string> = {
    ko: cat.name_ko,
    en: cat.name_en,
    ja: cat.name_ja,
    de: cat.name_de,
  };
  return map[locale] || cat.name_en;
}

function buildPageHref(
  sp: Record<string, string | undefined>,
  newPage: number
): string {
  const params = new URLSearchParams();
  if (sp.category) params.set('category', sp.category);
  if (sp.sort && sp.sort !== 'newest') params.set('sort', sp.sort);
  if (sp.sizes) params.set('sizes', sp.sizes);
  if (sp.colors) params.set('colors', sp.colors);
  if (sp.min_price) params.set('min_price', sp.min_price);
  if (sp.max_price) params.set('max_price', sp.max_price);
  if (newPage > 1) params.set('page', String(newPage));
  const qs = params.toString();
  return qs ? `/products?${qs}` : '/products';
}

function PaginationLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href as never}
      className="rounded border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-text-primary)] hover:bg-[var(--color-neutral-50)]"
    >
      {label}
    </Link>
  );
}
