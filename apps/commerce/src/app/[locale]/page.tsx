import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/server';
import { getFeaturedProducts, listProducts } from '@/lib/queries/products';
import { ProductCard } from '@/components/product/ProductCard';
import { Container } from '@/components/layout/Container';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { Suspense } from 'react';

// SSG + ISR — revalidate every hour
export const revalidate = 3600;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('title'), description: t('description') };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale, namespace: 'home' });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [featured, newArrivals] = await Promise.all([
    getFeaturedProducts(8),
    listProducts({ sort: 'newest', per_page: 8 }),
  ]);

  return (
    <div className="bg-[var(--color-bg)]">
      {/* Hero Section */}
      <section
        className="relative flex items-center justify-center min-h-[70vh] md:min-h-[80vh] bg-[var(--color-brand-primary)] overflow-hidden"
        aria-label="Hero"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #c8a96e 0%, transparent 60%), radial-gradient(circle at 70% 30%, #7a6e66 0%, transparent 50%)' }} />
        </div>

        <Container className="relative z-10 text-center py-24 md:py-32">
          <p className="text-[var(--color-brand-accent)] text-sm font-semibold tracking-[0.3em] uppercase mb-4">
            RAVI Collection
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            {t('headline')}
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-lg mx-auto mb-10 leading-relaxed">
            {t('subheadline')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/products"
              className="inline-flex items-center justify-center h-14 px-8 rounded bg-white text-[var(--color-brand-primary)] font-semibold text-base hover:bg-[var(--color-neutral-100)] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-accent)]"
            >
              {t('shopNow')}
            </Link>
            <Link
              href="/community"
              className="inline-flex items-center justify-center h-14 px-8 rounded border border-white/40 text-white font-semibold text-base hover:bg-white/10 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
            >
              {t('community')}
            </Link>
          </div>
        </Container>
      </section>

      {/* Featured Collection */}
      {featured.length > 0 && (
        <section className="py-16 md:py-24" aria-label={t('featuredCollection')}>
          <Container>
            <div className="flex items-end justify-between mb-8 md:mb-10">
              <div>
                <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[var(--color-brand-accent)] mb-2">
                  Curated
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)]">
                  {t('featuredCollection')}
                </h2>
              </div>
              <Link
                href="/products?featured=true"
                className="text-sm font-medium text-[var(--color-brand-secondary)] hover:text-[var(--color-brand-primary)] underline-offset-4 hover:underline transition-colors shrink-0 ml-4"
              >
                {t('viewAll')}
              </Link>
            </div>

            <Suspense fallback={<ProductGridSkeleton count={8} />}>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {featured.map((product, i) => (
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
          </Container>
        </section>
      )}

      {/* Value proposition banner */}
      <section className="bg-[var(--color-neutral-100)] py-10 md:py-14">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { icon: '🐾', title: 'Large Breed Fit', desc: 'Every piece is tailored for large dogs' },
              { icon: '✦', title: 'Premium Materials', desc: 'Durable, dog-safe fabrics that last' },
              { icon: '🌍', title: 'Global Shipping', desc: 'Delivered worldwide with care' },
            ].map((item) => (
              <div key={item.title} className="space-y-2">
                <p className="text-3xl">{item.icon}</p>
                <p className="font-semibold text-[var(--color-text-primary)]">{item.title}</p>
                <p className="text-sm text-[var(--color-text-secondary)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* New Arrivals */}
      {newArrivals.data.length > 0 && (
        <section className="py-16 md:py-24" aria-label={t('newArrivals')}>
          <Container>
            <div className="flex items-end justify-between mb-8 md:mb-10">
              <div>
                <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[var(--color-brand-accent)] mb-2">
                  Just In
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)]">
                  {t('newArrivals')}
                </h2>
              </div>
              <Link
                href="/products?sort=newest"
                className="text-sm font-medium text-[var(--color-brand-secondary)] hover:text-[var(--color-brand-primary)] underline-offset-4 hover:underline transition-colors shrink-0 ml-4"
              >
                {t('viewAll')}
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {newArrivals.data.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  locale={locale as Locale}
                  isAuthenticated={!!user}
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Community CTA */}
      <section className="py-16 md:py-20 bg-[var(--color-surface)]">
        <Container className="text-center">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[var(--color-brand-accent)] mb-3">
            Join the Pack
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
            {t('community')}
          </h2>
          <p className="text-[var(--color-text-secondary)] max-w-md mx-auto mb-8">
            Share your dog&apos;s style, get tips from other large-breed owners, and connect with the RAVI community.
          </p>
          <Link
            href="/community"
            className="inline-flex items-center justify-center h-12 px-7 rounded border border-[var(--color-brand-primary)] text-[var(--color-brand-primary)] font-semibold text-sm hover:bg-[var(--color-brand-primary)] hover:text-white transition-colors duration-200"
          >
            {t('community')} →
          </Link>
        </Container>
      </section>
    </div>
  );
}

