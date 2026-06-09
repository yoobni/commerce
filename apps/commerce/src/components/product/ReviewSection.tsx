'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { cn } from '@/lib/cn';
import { ReviewWriteForm } from './ReviewWriteForm';
import { loadMoreReviews } from '@/lib/api/reviews-client';
import type { ReviewWithUser, ReviewStats } from '@/lib/api/reviews';
import type { Locale } from '@commerce/types';
import { safeImageSrc, isFallback } from '@/lib/images/safeSrc';

interface ReviewSectionProps {
  productId: string;
  isAuthenticated: boolean;
  initialReviews: ReviewWithUser[];
  reviewStats: ReviewStats;
  totalCount: number;
  avgRating: number;
  locale: Locale;
}

export function ReviewSection({
  productId,
  isAuthenticated,
  initialReviews,
  reviewStats,
  totalCount,
  avgRating,
  locale,
}: ReviewSectionProps) {
  const t = useTranslations('review');
  const tProduct = useTranslations('product');

  const [reviews, setReviews] = useState(initialReviews);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialReviews.length < totalCount);
  const [loadingMore, setLoadingMore] = useState(false);
  const [photoOnly, setPhotoOnly] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [writeFormOpen, setWriteFormOpen] = useState(false);

  const handlePhotoOnlyToggle = useCallback(async () => {
    const next = !photoOnly;
    setPhotoOnly(next);
    setFilterLoading(true);
    try {
      const result = await loadMoreReviews(productId, 1, next);
      setReviews(result.data);
      setPage(1);
      setHasMore(result.has_next);
    } finally {
      setFilterLoading(false);
    }
  }, [photoOnly, productId]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await loadMoreReviews(productId, nextPage, photoOnly);
      setReviews((prev) => [...prev, ...result.data]);
      setPage(nextPage);
      setHasMore(result.has_next);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, page, productId, photoOnly]);

  const ratingTotal = reviewStats.ratingBreakdown.total;
  const sizeFeedbackTotal =
    (reviewStats.sizeFeedback?.SMALL ?? 0) +
    (reviewStats.sizeFeedback?.PERFECT ?? 0) +
    (reviewStats.sizeFeedback?.LARGE ?? 0);

  return (
    <section id="reviews" className="mb-16" aria-label={tProduct('reviews')}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
          {tProduct('reviews')}
          {totalCount > 0 && (
            <span className="ml-2 text-[var(--color-text-tertiary)] font-normal text-base">
              ({totalCount})
            </span>
          )}
        </h2>
        <button
          type="button"
          onClick={() => setWriteFormOpen(true)}
          className="text-sm font-medium px-4 py-2 rounded-lg border border-[var(--color-brand-primary)] text-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)] hover:text-white transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-accent)]"
        >
          {t('write')}
        </button>
      </div>

      {/* Stats: rating distribution + size feedback */}
      {ratingTotal > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 p-5 bg-[var(--color-neutral-50)] rounded-xl">
          {/* Rating distribution */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl font-bold text-[var(--color-text-primary)]">
                {Number.isFinite(avgRating) ? avgRating.toFixed(1) : '0.0'}
              </span>
              <div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon key={star} filled={star <= Math.round(avgRating)} />
                  ))}
                </div>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                  {t('total', { count: ratingTotal })}
                </p>
              </div>
            </div>
            <div className="space-y-1.5">
              {([5, 4, 3, 2, 1] as const).map((star) => {
                const count = reviewStats.ratingBreakdown[star];
                const pct = ratingTotal > 0 ? Math.round((count / ratingTotal) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-[var(--color-text-tertiary)] w-3 text-right shrink-0">
                      {star}
                    </span>
                    <StarIcon filled size={10} />
                    <div className="flex-1 h-1.5 bg-[var(--color-neutral-200)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#F5A623] rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-[var(--color-text-tertiary)] w-5 text-right shrink-0">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Size feedback — large-dog specific */}
          {sizeFeedbackTotal > 0 && (
            <SizeFeedbackSummary
              sizeFeedback={reviewStats.sizeFeedback}
              total={sizeFeedbackTotal}
            />
          )}
        </div>
      )}

      {/* Filters */}
      {totalCount > 0 && (
        <div className="flex items-center gap-3 mb-5">
          <button
            type="button"
            onClick={handlePhotoOnlyToggle}
            disabled={filterLoading}
            className={cn(
              'text-sm px-3 py-1.5 rounded-full border transition-all duration-150',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-accent)]',
              'disabled:opacity-60 disabled:cursor-not-allowed',
              photoOnly
                ? 'bg-[var(--color-brand-primary)] text-white border-[var(--color-brand-primary)]'
                : 'bg-white text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)]'
            )}
          >
            {t('photoOnly')}
          </button>
        </div>
      )}

      {/* Review list */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-tertiary)]">
          <p className="text-4xl mb-3" aria-hidden="true">
            ✦
          </p>
          <p className="font-medium text-[var(--color-text-primary)] mb-1">{t('noReviews')}</p>
        </div>
      ) : (
        <div
          className={cn('space-y-5', filterLoading && 'opacity-60 pointer-events-none')}
          aria-busy={filterLoading}
        >
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} locale={locale} />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 text-sm font-medium px-6 py-2.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-accent)]"
          >
            {loadingMore && (
              <svg
                className="animate-spin h-4 w-4 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            )}
            {t('loadMore')}
          </button>
        </div>
      )}

      {/* Write review modal */}
      <ReviewWriteForm
        open={writeFormOpen}
        onClose={() => setWriteFormOpen(false)}
        productId={productId}
        isAuthenticated={isAuthenticated}
      />
    </section>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarIcon({ filled, size = 14 }: { filled: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? '#F5A623' : 'none'}
      stroke={filled ? '#F5A623' : '#D1D5DB'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function SizeFeedbackSummary({
  sizeFeedback,
  total,
}: {
  sizeFeedback: ReviewStats['sizeFeedback'];
  total: number;
}) {
  const t = useTranslations('review');
  const items = [
    { key: 'SMALL' as const, label: t('sizeFeedbackSmall'), count: sizeFeedback.SMALL },
    { key: 'PERFECT' as const, label: t('sizeFeedbackPerfect'), count: sizeFeedback.PERFECT },
    { key: 'LARGE' as const, label: t('sizeFeedbackLarge'), count: sizeFeedback.LARGE },
  ];

  return (
    <div>
      <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
        {t('sizeFitSummary')}
      </p>
      <div className="space-y-3">
        {items.map(({ key, label, count }) => {
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--color-text-secondary)]">{label}</span>
                <span className="text-[var(--color-text-tertiary)]">{pct}%</span>
              </div>
              <div className="h-1.5 bg-[var(--color-neutral-200)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--color-brand-primary)] rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ReviewCardProps {
  review: ReviewWithUser;
  locale: Locale;
}

function ReviewCard({ review, locale }: ReviewCardProps) {
  const t = useTranslations('review');

  const sizeFeedbackLabels: Record<string, string> = {
    SMALL: t('sizeFeedbackSmall'),
    PERFECT: t('sizeFeedbackPerfect'),
    LARGE: t('sizeFeedbackLarge'),
  };

  return (
    <article className="border border-[var(--color-border)] rounded-lg p-5">
      {/* Author + rating + date */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[var(--color-neutral-200)] overflow-hidden shrink-0">
            {review.user.profile_image_url ? (
              <Image
                src={safeImageSrc(review.user.profile_image_url)}
                alt={review.user.name}
                width={36}
                height={36}
                className="object-cover w-full h-full"
                unoptimized={isFallback(safeImageSrc(review.user.profile_image_url))}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-medium text-[var(--color-text-tertiary)]">
                {review.user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              {review.user.name}
            </p>
            <div
              className="flex items-center gap-0.5 mt-0.5"
              aria-label={`Rating: ${review.rating} out of 5`}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} filled={i < review.rating} size={12} />
              ))}
            </div>
          </div>
        </div>
        <time
          dateTime={review.created_at}
          className="text-xs text-[var(--color-text-tertiary)] shrink-0"
        >
          {new Date(review.created_at).toLocaleDateString(locale === 'ko' ? 'ko-KR' : locale)}
        </time>
      </div>

      {/* Dog info + size badges — large-dog specific */}
      {(review.dog_breed ||
        review.dog_weight_kg ||
        review.purchased_size ||
        review.size_feedback) && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {review.dog_breed && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-neutral-100)] text-[var(--color-text-secondary)]">
              {review.dog_breed}
            </span>
          )}
          {review.dog_weight_kg != null && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-neutral-100)] text-[var(--color-text-secondary)]">
              {review.dog_weight_kg}kg
            </span>
          )}
          {review.purchased_size && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-neutral-100)] text-[var(--color-text-secondary)]">
              {review.purchased_size}
            </span>
          )}
          {review.size_feedback && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]">
              {sizeFeedbackLabels[review.size_feedback] ?? review.size_feedback}
            </span>
          )}
        </div>
      )}

      {/* Review content */}
      {review.content && (
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          {review.content}
        </p>
      )}

      {/* Best badge */}
      {review.is_best && (
        <div className="mt-3">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F5A623]/10 text-[#F5A623]">
            Best
          </span>
        </div>
      )}
    </article>
  );
}
