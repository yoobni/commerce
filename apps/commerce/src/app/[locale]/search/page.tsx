import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { routing, type Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/server';
import { listProducts } from '@/lib/queries/products';
import { Container } from '@/components/layout/Container';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    Object.entries(merged).forEach(([k, v]) => {
      if (v) p.set(k, v);
    });
    const qs = p.toString();
    return `/search${qs ? `?${qs}` : ''}`;
  }

  return (
    <div className="bg-[var(--mz-bg)] min-h-screen">
      <Container className="py-8 md:py-12">
        {/* Search input */}
        <div className="max-w-xl mb-8">
          <SearchBar initialQuery={query} placeholder={t('placeholder')} />
        </div>

        {/* Results header */}
        {query && (
          <div className="mb-6">
            <h1 className="font-serif text-[22px] md:text-[28px] font-[500] leading-[1.2] tracking-[-0.02em] text-[var(--mz-ink)]">
              &ldquo;{query}&rdquo;
            </h1>
            <p className="text-[12px] text-[var(--mz-ink-mute)] mt-1.5">
              {result.total > 0
                ? t('results', { count: result.total })
                : tEmpty('search.description')}
            </p>
          </div>
        )}

        {!query && (
          <div className="mb-6">
            <h1 className="font-serif text-[22px] md:text-[28px] font-[500] leading-[1.2] tracking-[-0.02em] text-[var(--mz-ink)]">
              {t('title')}
            </h1>
          </div>
        )}

        {/* Results grid */}
        {result.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="w-12 h-12 rounded-full bg-[var(--mz-bg-deep)] flex items-center justify-center mb-4"
              aria-hidden="true"
            >
              <SearchEmptyIcon />
            </div>
            <p className="font-medium text-[14px] text-[var(--mz-ink)] mb-1">
              {tEmpty('search.title')}
            </p>
            <p className="text-[12px] text-[var(--mz-ink-mute)] mb-6">
              {tEmpty('search.description')}
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center h-10 px-5 rounded-[var(--radius-md)] border border-[var(--mz-accent)] text-[var(--mz-accent)] text-[13px] font-medium hover:bg-[var(--mz-accent)] hover:text-[var(--mz-bg)] transition-colors duration-150"
            >
              {tEmpty('search.action')}
            </Link>
          </div>
        ) : (
          <>
            <Suspense fallback={<ProductGridSkeleton count={12} />}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
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
                  <Link
                    href={buildUrl({ page: String(currentPage - 1) })}
                    className="h-10 px-4 rounded-[var(--radius-md)] border border-[var(--mz-line-strong)] text-[12px] font-medium text-[var(--mz-ink)] hover:bg-[var(--mz-bg-deep)] transition-colors duration-150 inline-flex items-center"
                  >
                    {currentPage - 1}
                  </Link>
                )}
                <span className="text-[12px] text-[var(--mz-ink-mute)]">
                  {currentPage} / {totalPages}
                </span>
                {currentPage < totalPages && (
                  <Link
                    href={buildUrl({ page: String(currentPage + 1) })}
                    className="h-10 px-4 rounded-[var(--radius-md)] border border-[var(--mz-line-strong)] text-[12px] font-medium text-[var(--mz-ink)] hover:bg-[var(--mz-bg-deep)] transition-colors duration-150 inline-flex items-center"
                  >
                    {currentPage + 1}
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
}

function SearchEmptyIcon() {
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
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
