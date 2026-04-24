import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { listProducts } from '@/lib/queries/products';
import { Container } from '@/components/layout/Container';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { Suspense } from 'react';
import { SearchBar } from './_components/SearchBar';

// SSR — query depends on search param
export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: 'search' });
  return {
    title: sp.q ? `"${sp.q}" — ${t('title')}` : t('title'),
  };
}

const PER_PAGE = 24;

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const sp = await searchParams;
  const query = sp.q?.trim() ?? '';
  const currentPage = Math.max(1, parseInt(sp.page ?? '1', 10));

  const t = await getTranslations({ locale, namespace: 'search' });
  const tEmpty = await getTranslations({ locale, namespace: 'empty' });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const result = await listProducts({
    q: query || undefined,
    sort: 'popular',
    page: currentPage,
    per_page: PER_PAGE,
  });

  const totalPages = Math.ceil(result.total / PER_PAGE);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const merged: Record<string, string | undefined> = {
      q: query || undefined,
      page: undefined,
      ...overrides,
    };
    const p = new URLSearchParams();
    Object.entries(merged).forEach(([k, v]) => { if (v) p.set(k, v); });
    const qs = p.toString();
    return `/search${qs ? `?${qs}` : ''}`;
  }

  return (
    <div className="bg-[var(--color-bg)] min-h-screen">
      <Container className="py-8 md:py-12">
        {/* Search input */}
        <div className="max-w-xl mb-8">
          <SearchBar initialQuery={query} placeholder={t('placeholder')} />
        </div>

        {/* Results header */}
        {query && (
          <div className="mb-6">
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
              &ldquo;{query}&rdquo;
            </h1>
            <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
              {result.total > 0
                ? t('results', { count: result.total })
                : tEmpty('search.description')}
            </p>
          </div>
        )}

        {!query && (
          <div className="mb-6">
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
              {t('title')}
            </h1>
          </div>
        )}

        {/* Results grid */}
        {result.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-5xl mb-4">🔍</p>
            <p className="font-semibold text-[var(--color-text-primary)] mb-1">
              {tEmpty('search.title')}
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">
              {tEmpty('search.description')}
            </p>
            <a
              href="/products"
              className="inline-flex items-center justify-center h-10 px-5 rounded border border-[var(--color-brand-primary)] text-[var(--color-brand-primary)] text-sm font-medium hover:bg-[var(--color-brand-primary)] hover:text-white transition-colors"
            >
              {tEmpty('search.action')}
            </a>
          </div>
        ) : (
          <>
            <Suspense fallback={<ProductGridSkeleton count={12} />}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {result.data.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    locale={locale as Locale}
                    isAuthenticated={!!user}
                    priority={i < 4}
                  />
                ))}
              </div>
            </Suspense>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-12">
                {currentPage > 1 && (
                  <a
                    href={buildUrl({ page: String(currentPage - 1) })}
                    className="h-10 px-4 rounded border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-neutral-50)] transition-colors inline-flex items-center"
                  >
                    ←
                  </a>
                )}
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {currentPage} / {totalPages}
                </span>
                {currentPage < totalPages && (
                  <a
                    href={buildUrl({ page: String(currentPage + 1) })}
                    className="h-10 px-4 rounded border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-neutral-50)] transition-colors inline-flex items-center"
                  >
                    →
                  </a>
                )}
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
}
