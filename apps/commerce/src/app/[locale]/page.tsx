import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { getFeaturedProducts } from '@/lib/queries/products';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { Container, Section } from '@/components/layout/Container';
import { Suspense } from 'react';

// SSG + ISR — revalidate every hour
export const revalidate = 3600;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('title') };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale, namespace: 'home' });

  const featured = await getFeaturedProducts(8);

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      {/* ── Hero ── */}
      <section
        className="relative flex min-h-[70vh] flex-col items-center justify-center bg-[var(--color-neutral-100)] px-6 text-center"
        aria-label="hero"
      >
        <div className="flex flex-col items-center gap-6 max-w-xl">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-5xl lg:text-6xl">
            {t('headline')}
          </h1>
          <p className="text-base text-[var(--color-text-secondary)] sm:text-lg">
            {t('subheadline')}
          </p>
          <Link
            href="/products"
            className="inline-flex h-[52px] items-center justify-center rounded bg-[var(--color-cta)] px-8 text-base font-medium text-white transition-opacity hover:opacity-90 active:opacity-80"
          >
            {t('shopNow')}
          </Link>
        </div>
      </section>

      {/* ── Featured Collection ── */}
      <Section as="section" aria-label="featured-collection">
        <Container>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] sm:text-2xl">
              {t('featuredCollection')}
            </h2>
            <Link
              href="/products"
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:underline underline-offset-2 transition-colors"
            >
              {t('viewAll')}
            </Link>
          </div>

          {featured.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
              {featured.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  locale={locale as Locale}
                  priority={i < 4}
                />
              ))}
            </div>
          ) : (
            <Suspense fallback={<ProductGridSkeleton count={8} />}>
              <ProductGridSkeleton count={8} />
            </Suspense>
          )}
        </Container>
      </Section>
    </main>
  );
}
