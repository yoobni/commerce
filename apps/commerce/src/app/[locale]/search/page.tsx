import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { listProducts } from '@/lib/queries/products';
import { ProductCard } from '@/components/product/ProductCard';
import { Container } from '@/components/layout/Container';
import { SearchInput } from './_components/SearchInput';

// SSR — search results are always dynamic
export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: 'search' });
  const title = sp.q ? t('queryLabel', { q: sp.q }) : t('title');
  return { title };
}

const PER_PAGE = 20;

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const sp = await searchParams;
  const query = sp.q?.trim() ?? '';
  const page = Math.max(1, parseInt(sp.page ?? '1', 10));

  const t = await getTranslations({ locale, namespace: 'search' });
  const tp = await getTranslations({ locale, namespace: 'plp' });
  const te = await getTranslations({ locale, namespace: 'empty' });

  const result = query
    ? await listProducts({ search: query, page, per_page: PER_PAGE, sort: 'newest' })
    : { data: [], total: 0, page: 1, per_page: PER_PAGE, has_next: false };

  const { data: products, total } = result;
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <Container className="py-8 md:py-12">

        {/* ── Search input ── */}
        <div className="mb-8 max-w-xl">
          <SearchInput
            defaultValue={query}
            placeholder={t('placeholder')}
          />
        </div>

        {/* ── Results header ── */}
        {query && (
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
              {t('queryLabel', { q: query })}
            </h1>
            {total > 0 && (
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                {tp('results', { count: total })}
              </p>
            )}
          </div>
        )}

        {/* ── No query state ── */}
        {!query && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
              {t('title')}
            </h1>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              {t('placeholder')}
            </p>
          </div>
        )}

        {/* ── No results ── */}
        {query && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <p className="text-base font-semibold text-[var(--color-text-primary)]">
              {te('search.title')}
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {te('search.description')}
            </p>
            <Link
              href="/products"
              className="mt-2 text-sm font-medium text-[var(--color-text-primary)] underline underline-offset-2 hover:opacity-70"
            >
              {te('search.action')}
            </Link>
          </div>
        )}

        {/* ── Results grid ── */}
        {products.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {products.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  locale={locale as Locale}
                  priority={i < 4}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                {page > 1 && (
                  <PaginationLink
                    href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
                    label={tp('prevPage')}
                  />
                )}
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {tp('pageOf', { page, total: totalPages })}
                </span>
                {page < totalPages && (
                  <PaginationLink
                    href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
                    label={tp('nextPage')}
                  />
                )}
              </div>
            )}
          </>
        )}
      </Container>
    </main>
  );
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
