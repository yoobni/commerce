import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { getProductReviews, getProductRatingStats } from '@/lib/reviews/queries';
import type { Locale } from '@/i18n/routing';
import { ReviewCard } from './ReviewCard';
import { ReviewRatingStats } from './ReviewRatingStats';

interface ReviewListProps {
  productId: string;
  locale: Locale;
  page?: number;
  /** Link to write a review (e.g. /ko/account/reviews/write?...) */
  writeReviewHref?: string;
}

const PER_PAGE = 10;

/** Server component — fetches & renders reviews with rating stats. */
export async function ReviewList({
  productId,
  locale,
  page = 1,
  writeReviewHref,
}: ReviewListProps) {
  const [{ data: reviews, total, has_next }, stats, t] = await Promise.all([
    getProductReviews(productId, page, PER_PAGE),
    getProductRatingStats(productId),
    getTranslations({ locale, namespace: 'review' }),
  ]);

  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = has_next ? page + 1 : null;

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          {t('title')}
          {total > 0 && (
            <span className="ml-2 text-sm font-normal text-[var(--color-text-secondary)]">
              ({total})
            </span>
          )}
        </h2>
        {writeReviewHref && (
          <Link
            href={writeReviewHref}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary)]/90 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            {t('writeReview')}
          </Link>
        )}
      </div>

      {/* Rating stats */}
      <ReviewRatingStats stats={stats} />

      {/* Review list */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 text-sm text-[var(--color-text-secondary)]">
          {t('empty')}
        </div>
      ) : (
        <>
          <div className="mt-4 divide-y divide-[var(--color-border)]">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {/* Pagination */}
          {(prevPage !== null || nextPage !== null) && (
            <div className="flex items-center justify-center gap-3 mt-6">
              {prevPage !== null && (
                <Link
                  href={`?page=${prevPage}`}
                  className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-neutral-50)] transition-colors"
                >
                  ← {t('prevPage')}
                </Link>
              )}
              <span className="text-xs text-[var(--color-text-secondary)]">
                {page} / {Math.ceil(total / PER_PAGE)}
              </span>
              {nextPage !== null && (
                <Link
                  href={`?page=${nextPage}`}
                  className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-neutral-50)] transition-colors"
                >
                  {t('nextPage')} →
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
