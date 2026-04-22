import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { ReviewWithUser } from '@/lib/reviews/queries';
import { RatingStars } from './RatingStars';

interface ReviewCardProps {
  review: ReviewWithUser;
}

function formatDate(isoStr: string): string {
  return new Intl.DateTimeFormat('default', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(isoStr));
}

const SIZE_FEEDBACK_COLORS = {
  SMALL: 'bg-blue-50 text-blue-700',
  PERFECT: 'bg-emerald-50 text-emerald-700',
  LARGE: 'bg-orange-50 text-orange-700',
} as const;

export function ReviewCard({ review }: ReviewCardProps) {
  const t = useTranslations('review');

  const sizeFeedbackLabel = {
    SMALL: t('sizeFeedback.SMALL'),
    PERFECT: t('sizeFeedback.PERFECT'),
    LARGE: t('sizeFeedback.LARGE'),
  }[review.size_feedback];

  const images = review.images ?? [];

  return (
    <article className="py-5 border-b border-[var(--color-border)] last:border-0">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {/* Avatar */}
          {review.user?.profile_image_url ? (
            <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 bg-[var(--color-neutral-100)]">
              <Image
                src={review.user.profile_image_url}
                alt={review.user.name}
                fill
                className="object-cover"
                sizes="32px"
                unoptimized
              />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-[var(--color-neutral-200)] shrink-0 flex items-center justify-center text-xs font-semibold text-[var(--color-text-secondary)]">
              {review.user?.name?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
              {review.user?.name ?? '—'}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {formatDate(review.created_at)}
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 shrink-0">
          {review.is_best && (
            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              {t('bestReview')}
            </span>
          )}
          {review.is_photo_review && (
            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700">
              {t('photoReview')}
            </span>
          )}
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-2">
        <RatingStars rating={review.rating} size="sm" />
        <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
          {review.rating}.0
        </span>
      </div>

      {/* Meta: size + feedback */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {review.purchased_size && (
          <span className="inline-flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
            <span>{t('purchasedSize')}:</span>
            <span className="font-medium text-[var(--color-text-primary)]">{review.purchased_size}</span>
          </span>
        )}
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${SIZE_FEEDBACK_COLORS[review.size_feedback]}`}
        >
          {sizeFeedbackLabel}
        </span>
        {(review.dog_breed || review.dog_weight_kg) && (
          <span className="text-xs text-[var(--color-text-secondary)]">
            {[review.dog_breed, review.dog_weight_kg ? `${review.dog_weight_kg}kg` : null]
              .filter(Boolean)
              .join(' · ')}
          </span>
        )}
      </div>

      {/* Content */}
      <p className="text-sm text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap break-words">
        {review.content}
      </p>

      {/* Images */}
      {images.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((url, idx) => (
            <div
              key={idx}
              className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-[var(--color-neutral-100)]"
            >
              <Image
                src={url}
                alt={`Review photo ${idx + 1}`}
                fill
                className="object-cover"
                sizes="80px"
                unoptimized
              />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
