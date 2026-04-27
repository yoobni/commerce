import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { routing, type Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/server';
import { getFeaturedProducts, listProducts } from '@/lib/queries/products';
import { ProductCard } from '@/components/product/ProductCard';
import { Container } from '@/components/layout/Container';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { FitForHanaCard } from '@/components/ui/FitForHanaCard';
import { Button } from '@/components/ui';
import { JsonLd, buildOrganizationSchema } from '@/components/seo/JsonLd';

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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ravidog.com';

  return (
    <div className="bg-[var(--mz-bg)]">
      <JsonLd data={buildOrganizationSchema(siteUrl)} />

      {/* ── Hero — full-bleed, serif display, eyebrow ───────────────────── */}
      <section
        className="relative overflow-hidden bg-[var(--mz-bg-deep)] min-h-[75vh] md:min-h-[82vh] flex items-end"
        aria-label="Hero"
      >
        {/* Wordmark watermark — image placeholder until real photo is sourced */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
          <span className="font-serif text-[28vw] md:text-[22vw] font-[600] text-[var(--mz-ink)] opacity-[0.03] select-none leading-none tracking-[-0.04em]">
            RAVI
          </span>
        </div>

        {/* Text block — bottom-left, editorial layout */}
        <Container className="relative z-10 pb-12 md:pb-20 pt-28">
          <p className="text-eyebrow text-[var(--mz-ink-mute)] mb-4">
            Premium Large Dog Apparel
          </p>
          <h1 className="font-serif text-[42px] md:text-[56px] lg:text-[68px] font-[500] leading-[1.04] tracking-[-0.03em] text-[var(--mz-ink)] mb-5 max-w-[540px]">
            {t('headline')}
          </h1>
          <p className="text-[13px] text-[var(--mz-ink-soft)] max-w-[280px] mb-9 leading-[1.65]">
            {t('subheadline')}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/products">
              <Button size="lg">{t('shopNow')}</Button>
            </Link>
            <Link href="/community">
              <Button size="lg" variant="ghost">{t('community')}</Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* ── Fit-for-Hana bar ────────────────────────────────────────────── */}
      {/* Profile null = onboarding not done — shows "Set up your hound's profile →" */}
      <Container className="pt-4 pb-0">
        <FitForHanaCard profile={null} setupHref="/onboarding" />
      </Container>

      {/* ── Featured Collection ─────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="pt-12 pb-10 md:pt-16 md:pb-14" aria-labelledby="featured-heading">
          <Container>
            <div className="flex items-end justify-between mb-6 md:mb-8">
              <div>
                <p className="text-eyebrow text-[var(--mz-accent)] mb-2">Curated</p>
                <h2
                  id="featured-heading"
                  className="font-serif text-[26px] md:text-[32px] font-[500] leading-[1.15] tracking-[-0.02em] text-[var(--mz-ink)]"
                >
                  {t('featuredCollection')}
                </h2>
              </div>
              <Link
                href="/products?featured=true"
                className="text-[12px] font-medium text-[var(--mz-ink-mute)] hover:text-[var(--mz-ink)] transition-colors shrink-0 ml-4"
              >
                {t('viewAll')} →
              </Link>
            </div>

            {/* Horizontal scroll on mobile / grid on desktop */}
            <div className="-mx-5 md:mx-0 px-5 md:px-0">
              <Suspense fallback={<ProductGridSkeleton count={4} />}>
                <div className="flex gap-3 overflow-x-auto scrollbar-none [-webkit-overflow-scrolling:touch] pb-2 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-4 md:overflow-visible md:pb-0">
                  {featured.slice(0, 8).map((product, i) => (
                    <div key={product.id} className="shrink-0 w-[164px] md:w-auto">
                      <ProductCard
                        product={product}
                        locale={locale as Locale}
                        isAuthenticated={!!user}
                        priority={i < 4}
                      />
                    </div>
                  ))}
                </div>
              </Suspense>
            </div>
          </Container>
        </section>
      )}

      {/* ── Value propositions ───────────────────────────────────────────── */}
      <section className="py-10 md:py-12 bg-[var(--mz-surface)]" aria-label="Why RAVI">
        <Container>
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            {VALUE_PROPS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center gap-2">
                <div
                  className="w-10 h-10 rounded-full bg-[var(--mz-bg-deep)] flex items-center justify-center shrink-0"
                  aria-hidden="true"
                >
                  <Icon />
                </div>
                <p className="text-[11px] md:text-[12px] font-semibold text-[var(--mz-ink)] leading-tight">
                  {title}
                </p>
                <p className="hidden sm:block text-[11px] text-[var(--mz-ink-mute)] leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── New Arrivals ────────────────────────────────────────────────── */}
      {newArrivals.data.length > 0 && (
        <section className="py-12 md:py-16" aria-labelledby="new-arrivals-heading">
          <Container>
            <div className="flex items-end justify-between mb-6 md:mb-8">
              <div>
                <p className="text-eyebrow text-[var(--mz-ink-mute)] mb-2">Just In</p>
                <h2
                  id="new-arrivals-heading"
                  className="font-serif text-[26px] md:text-[32px] font-[500] leading-[1.15] tracking-[-0.02em] text-[var(--mz-ink)]"
                >
                  {t('newArrivals')}
                </h2>
              </div>
              <Link
                href="/products?sort=newest"
                className="text-[12px] font-medium text-[var(--mz-ink-mute)] hover:text-[var(--mz-ink)] transition-colors shrink-0 ml-4"
              >
                {t('viewAll')} →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {newArrivals.data.slice(0, 8).map((product) => (
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

      {/* ── Community CTA ───────────────────────────────────────────────── */}
      <section className="py-14 md:py-20 bg-[var(--mz-bg-deep)]" aria-labelledby="community-heading">
        <Container className="text-center">
          <p className="text-eyebrow text-[var(--mz-ink-mute)] mb-4">Join the Pack</p>
          <h2
            id="community-heading"
            className="font-serif text-[28px] md:text-[36px] font-[500] leading-[1.12] tracking-[-0.02em] text-[var(--mz-ink)] mb-4 max-w-[400px] mx-auto"
          >
            {t('community')}
          </h2>
          <p className="text-[13px] text-[var(--mz-ink-soft)] max-w-[300px] mx-auto mb-9 leading-[1.65]">
            Share your dog&apos;s style, get tips from large-breed owners, and connect with the RAVI community.
          </p>
          <Link href="/community">
            <Button variant="ghost">{t('community')} →</Button>
          </Link>
        </Container>
      </section>

    </div>
  );
}

// ── Value prop data ───────────────────────────────────────────────────────────

const VALUE_PROPS = [
  {
    title: 'Large breed fit',
    desc: 'Sized for dogs 25 kg+',
    icon: DogIcon,
  },
  {
    title: 'Premium fabrics',
    desc: 'Dog-safe, wash-durable',
    icon: TagIcon,
  },
  {
    title: 'Global shipping',
    desc: 'Delivered worldwide',
    icon: GlobeIcon,
  },
] as const;

// ── Inline SVG icons (value props) ───────────────────────────────────────────

function DogIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--mz-ink-mute)]" aria-hidden="true">
      <path d="M4 14c0-4.4 3.6-8 8-8s8 3.6 8 8v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2z" />
      <path d="M7 6c-1.5-1-2.5-1.5-3-1l-.5 3" />
      <path d="M17 6c1.5-1 2.5-1.5 3-1l.5 3" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--mz-ink-mute)]" aria-hidden="true">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--mz-ink-mute)]" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
