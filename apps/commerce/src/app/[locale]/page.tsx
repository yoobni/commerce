import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { routing, type Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { buildAlternates } from '@/lib/seo/alternates';
import { createClient } from '@/lib/supabase/server';
import { getFeaturedProducts, listProducts } from '@/lib/api/products';
import { ProductCard } from '@/components/product/ProductCard';
import { Container } from '@/components/layout/Container';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { FitForHanaCard } from '@/components/ui/FitForHanaCard';
import { Button } from '@/components/ui';

// SSG + ISR — revalidate every hour
export const revalidate = 3600;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates('/', locale),
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale, namespace: 'home' });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [featured, newArrivals] = await Promise.all([
    getFeaturedProducts(8),
    listProducts({ sort: 'newest', per_page: 8 }),
  ]);

  return (
    <div className="bg-[var(--mz-bg)]">
      {/* ── Hero — full-bleed, serif display, eyebrow ───────────────────── */}
      <section
        className="relative overflow-hidden bg-[var(--mz-bg-deep)] min-h-[75vh] md:min-h-[82vh] flex items-end"
        aria-label="Hero"
      >
        {/* Wordmark watermark — image placeholder until real photo is sourced */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          aria-hidden="true"
        >
          <span className="font-serif text-[28vw] md:text-[22vw] font-[600] text-[var(--mz-ink)] opacity-[0.03] select-none leading-none tracking-[-0.04em]">
            RAVI
          </span>
        </div>

        {/* Text block — bottom-left, editorial layout. M3 italic-accent keyword via t.rich */}
        <Container className="relative z-10 pb-12 md:pb-20 pt-28">
          <p className="text-eyebrow text-[var(--mz-ink-mute)] mb-4">Premium Large Dog Apparel</p>
          <h1 className="font-serif text-[42px] md:text-[56px] lg:text-[68px] font-[500] leading-[1.04] tracking-[-0.03em] text-[var(--mz-ink)] mb-5 max-w-[540px]">
            {t.rich('headlineRich', {
              em: (chunks) => <em className="font-serif italic font-[500]">{chunks}</em>,
            })}
          </h1>
          <p className="text-[13px] text-[var(--mz-ink-soft)] max-w-[280px] mb-9 leading-[1.65]">
            {t('subheadline')}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/products">
              <Button size="lg">{t('shopNow')}</Button>
            </Link>
            <Link href="/community">
              <Button size="lg" variant="ghost">
                {t('community')}
              </Button>
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
                <p className="text-eyebrow text-[var(--mz-accent)] mb-2">{t('curatedForHana')}</p>
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

      {/* ── Shop by hound — M3 breed-tile grid ──────────────────────────── */}
      <section className="py-12 md:py-16" aria-labelledby="shop-by-hound-heading">
        <Container>
          <div className="mb-6 md:mb-8">
            <p className="text-eyebrow text-[var(--mz-ink-mute)] mb-2">{t('shopByHoundEyebrow')}</p>
            <h2
              id="shop-by-hound-heading"
              className="font-serif text-[26px] md:text-[32px] font-[500] leading-[1.15] tracking-[-0.02em] text-[var(--mz-ink)]"
            >
              {t('shopByHound')}
            </h2>
          </div>
          <ul className="grid grid-cols-3 gap-4 md:gap-6 lg:grid-cols-6">
            {BREED_TILES.map((breed) => (
              <li key={breed.slug}>
                <Link
                  href={`/products?breed=${breed.slug}`}
                  className="group flex flex-col items-center gap-2 text-center"
                >
                  <div
                    className="w-full aspect-square rounded-full overflow-hidden bg-[var(--mz-bg-deep)] grid place-items-center transition-colors group-hover:bg-[var(--mz-accent-soft)]"
                    aria-hidden="true"
                  >
                    <HoundAvatarSilhouette seed={breed.seed} />
                  </div>
                  <p className="font-serif text-[13px] md:text-[14px] font-medium text-[var(--mz-ink)] leading-tight tracking-[-0.005em]">
                    {breed.name}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
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

      {/* ── Journal — M3 editorial 2-col ────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-[var(--mz-surface)]" aria-labelledby="journal-heading">
        <Container>
          <div className="mb-6 md:mb-8">
            <p className="text-eyebrow text-[var(--mz-ink-mute)] mb-2">{t('journalEyebrow')}</p>
            <h2
              id="journal-heading"
              className="font-serif text-[26px] md:text-[32px] font-[500] leading-[1.15] tracking-[-0.02em] text-[var(--mz-ink)]"
            >
              {t('journal')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {JOURNAL_STORIES.map((story) => (
              <Link
                key={story.slug}
                href={`/community`}
                className="group block"
              >
                <div className="aspect-[4/3] rounded-[var(--radius-md)] overflow-hidden bg-[var(--mz-bg-deep)] grid place-items-center transition-colors group-hover:bg-[var(--mz-accent-soft)]">
                  <JournalIllus seed={story.seed} />
                </div>
                <p className="text-eyebrow text-[var(--mz-ink-mute)] mt-4">{story.eyebrow}</p>
                <h3 className="mt-1 font-serif text-[20px] md:text-[22px] font-[500] leading-[1.2] tracking-[-0.015em] text-[var(--mz-ink)] group-hover:underline underline-offset-2">
                  {story.title}
                </h3>
                <p className="mt-2 text-[12.5px] leading-[1.6] text-[var(--mz-ink-soft)]">
                  {story.dek}
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Community CTA ───────────────────────────────────────────────── */}
      <section
        className="py-14 md:py-20 bg-[var(--mz-bg-deep)]"
        aria-labelledby="community-heading"
      >
        <Container className="text-center">
          <p className="text-eyebrow text-[var(--mz-ink-mute)] mb-4">Join the Pack</p>
          <h2
            id="community-heading"
            className="font-serif text-[28px] md:text-[36px] font-[500] leading-[1.12] tracking-[-0.02em] text-[var(--mz-ink)] mb-4 max-w-[400px] mx-auto"
          >
            {t('community')}
          </h2>
          <p className="text-[13px] text-[var(--mz-ink-soft)] max-w-[300px] mx-auto mb-9 leading-[1.65]">
            Share your dog&apos;s style, get tips from large-breed owners, and connect with the RAVI
            community.
          </p>
          <Link href="/community">
            <Button variant="ghost">{t('community')} →</Button>
          </Link>
        </Container>
      </section>
    </div>
  );
}

// ── Shop-by-hound breed list (M3 spec: 6 breeds) ─────────────────────────────
// Slugs are kept English so they round-trip through the products filter URL
// regardless of locale. Names are intentionally not translated for now — breed
// terms (Retriever, Malamute, Berner Sennen) read globally as-is.

const BREED_TILES = [
  { slug: 'golden-retriever', name: 'Golden', seed: 0 },
  { slug: 'labrador', name: 'Labrador', seed: 1 },
  { slug: 'malamute', name: 'Malamute', seed: 2 },
  { slug: 'bernese', name: 'Bernese', seed: 3 },
  { slug: 'shepherd', name: 'Shepherd', seed: 4 },
  { slug: 'samoyed', name: 'Samoyed', seed: 5 },
] as const;

// ── Journal stories (M3 spec: 2-col editorial cards) ─────────────────────────
// Placeholder copy until a journal CMS or community-featured story endpoint
// is wired up. Both tiles link to /community as a stop-gap landing.

const JOURNAL_STORIES = [
  {
    slug: 'fit-for-large-breeds',
    eyebrow: 'Fit guide',
    title: 'Four numbers to the perfect fit.',
    dek: '가슴, 목, 등, 몸무게. 대형견에게 맞는 사이즈를 고르는 가장 정직한 방법.',
    seed: 0,
  },
  {
    slug: 'waxed-cotton-care',
    eyebrow: 'Field notes',
    title: 'Waxed cotton, lived in.',
    dek: '시즌이 흐를수록 깊어지는 패브릭의 결을 다루는 법.',
    seed: 1,
  },
] as const;

// ── SVG illustrations — placeholders until commissioned art lands ───────────

function HoundAvatarSilhouette({ seed }: { seed: number }) {
  // Tiny hound head silhouette — varies subtly by seed so the 6 tiles don't
  // look identical. Single-color ink stroke per Muzzle illustration spec.
  const earDrop = 2 + (seed % 3);
  const snout = 12 + (seed % 2);
  return (
    <svg
      viewBox="0 0 64 64"
      width="62%"
      height="62%"
      fill="none"
      stroke="var(--mz-ink)"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={`M18 16 q -4 ${4 + earDrop}, 0 ${10 + earDrop}`} />
      <path d={`M46 16 q 4 ${4 + earDrop}, 0 ${10 + earDrop}`} />
      <path
        d={`M18 22 q -3 14, 6 22 q 8 6, 16 0 q 9 -8, 6 -22 q -4 -6, -14 -6 q -10 0, -14 6 Z`}
      />
      <ellipse cx="32" cy={snout + 18} rx="2.2" ry="1.6" fill="var(--mz-ink)" stroke="none" />
      <circle cx="25" cy="32" r="1.4" fill="var(--mz-ink)" stroke="none" />
      <circle cx="39" cy="32" r="1.4" fill="var(--mz-ink)" stroke="none" />
    </svg>
  );
}

function JournalIllus({ seed }: { seed: number }) {
  // Two distinct editorial-feel illustrations: a running hound (seed 0) and a
  // folded garment lay (seed 1). Single ink stroke + one accent fill.
  if (seed === 1) {
    return (
      <svg
        viewBox="0 0 240 180"
        width="62%"
        height="62%"
        fill="none"
        stroke="var(--mz-ink)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* Folded trench lay — flat-folded shoulders + body block */}
        <path d="M58 56 L120 36 L182 56 L172 130 L68 130 Z" />
        <path d="M120 36 L120 130" />
        <path d="M58 56 L88 80" />
        <path d="M182 56 L152 80" />
        <rect
          x="92"
          y="92"
          width="56"
          height="22"
          fill="var(--mz-accent)"
          stroke="none"
          opacity="0.88"
        />
        <path d="M92 102 L148 102" stroke="var(--mz-bg)" strokeWidth="0.6" opacity="0.5" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 240 180"
      width="68%"
      height="68%"
      fill="none"
      stroke="var(--mz-ink)"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Running hound silhouette — side profile, simplified */}
      <path d="M40 110 q 14 -28, 60 -24 q 28 2, 48 18 q 8 6, 30 4 q 8 0, 18 8" />
      <path d="M170 116 q 6 12, 0 26" />
      <path d="M148 124 q 4 16, -2 28" />
      <path d="M110 126 q -4 16, -10 24" />
      <path d="M76 122 q -10 14, -16 22" />
      <ellipse cx="206" cy="118" rx="3" ry="2" fill="var(--mz-ink)" stroke="none" />
      <path
        d="M60 102 q 30 -14, 80 -10 q 24 2, 50 12 L188 120 q -28 -6, -56 -6 q -36 0, -72 -10 Z"
        fill="var(--mz-accent)"
        stroke="none"
        opacity="0.85"
      />
    </svg>
  );
}
