import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { routing, type Locale } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { listUserReviews } from '@/lib/queries/reviews';
import { Link } from '@/i18n/navigation';
import { DeleteReviewButton } from './_components/DeleteReviewButton';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'account.reviews' });
  return { title: t('title') };
}

type LocaleNameKey = 'name_ko' | 'name_en' | 'name_ja' | 'name_de';
const LOCALE_NAME_KEY: Record<string, LocaleNameKey> = {
  ko: 'name_ko',
  en: 'name_en',
  ja: 'name_ja',
  de: 'name_de',
};

export default async function ReviewsPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale, namespace: 'account.reviews' });
  const tReview = await getTranslations({ locale, namespace: 'review' });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: reviews } = await listUserReviews(user.id);

  const nameKey = LOCALE_NAME_KEY[locale as Locale] ?? 'name_en';

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
        {t('title')}
        {reviews.length > 0 && (
          <span className="ml-2 text-[var(--color-text-tertiary)] text-sm font-normal">
            ({reviews.length})
          </span>
        )}
      </h2>

      {reviews.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-16 flex flex-col items-center justify-center text-center">
          <p className="text-4xl mb-3">✏️</p>
          <p className="text-sm text-[var(--color-text-secondary)]">{t('noReviews')}</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => {
            const productName =
              (review.product as unknown as Record<string, string>)[nameKey] ??
              review.product.name_en;

            return (
              <li
                key={review.id}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
              >
                {/* Product info */}
                <div className="flex gap-3 mb-4">
                  <div className="relative w-14 h-16 rounded-lg overflow-hidden bg-[var(--color-neutral-100)] shrink-0">
                    <Image
                      src={review.product.thumbnail_url}
                      alt={productName}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                      {productName}
                    </p>
                    <Link
                      href={`/products/${review.product.slug}`}
                      className="text-xs text-[var(--color-brand-primary)] hover:underline mt-0.5 inline-block"
                    >
                      {t('viewProduct')}
                    </Link>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-[var(--color-neutral-200)]'}`}
                    >
                      ★
                    </span>
                  ))}
                  <span className="text-xs text-[var(--color-text-tertiary)] ml-1">
                    {review.rating}.0
                  </span>
                </div>

                {/* Content */}
                <p className="text-sm text-[var(--color-text-primary)] leading-relaxed mb-3">
                  {review.content}
                </p>

                {/* Images */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mb-3 overflow-x-auto">
                    {review.images.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative w-16 h-16 rounded-lg overflow-hidden bg-[var(--color-neutral-100)] shrink-0"
                      >
                        <Image
                          src={url}
                          alt={`review image ${idx + 1}`}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
                  <div className="flex items-center gap-3">
                    <time
                      dateTime={review.created_at}
                      className="text-xs text-[var(--color-text-tertiary)]"
                    >
                      {new Date(review.created_at).toLocaleDateString(
                        locale === 'ko' ? 'ko-KR' : locale
                      )}
                    </time>
                    {review.point_rewarded && (
                      <span className="text-xs font-medium text-green-600">
                        {t('pointRewarded')}
                      </span>
                    )}
                    {review.size_feedback && (
                      <span className="text-xs text-[var(--color-text-tertiary)]">
                        {review.size_feedback === 'SMALL'
                          ? tReview('sizeFeedbackSmall')
                          : review.size_feedback === 'LARGE'
                            ? tReview('sizeFeedbackLarge')
                            : tReview('sizeFeedbackPerfect')}
                      </span>
                    )}
                  </div>
                  <DeleteReviewButton
                    reviewId={review.id}
                    productSlug={review.product.slug}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
