import { useTranslations } from 'next-intl';
import type { RatingStats } from '@/lib/reviews/queries';
import { RatingStars } from './RatingStars';

interface ReviewRatingStatsProps {
  stats: RatingStats;
}

export function ReviewRatingStats({ stats }: ReviewRatingStatsProps) {
  const t = useTranslations('review');

  if (stats.total === 0) {
    return (
      <div className="text-center py-6 text-sm text-[var(--color-text-secondary)]">
        {t('stats.noReviews')}
      </div>
    );
  }

  const avgDisplay = stats.avg_rating.toFixed(1);

  return (
    <div className="flex flex-col sm:flex-row items-start gap-6 p-5 bg-[var(--color-neutral-50)] rounded-xl">
      {/* Average score */}
      <div className="flex flex-col items-center shrink-0 min-w-[80px]">
        <p className="text-4xl font-bold text-[var(--color-text-primary)]">{avgDisplay}</p>
        <RatingStars rating={stats.avg_rating} size="sm" className="mt-1" />
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
          {t('stats.totalReviews', { count: stats.total })}
        </p>
      </div>

      {/* Distribution bars */}
      <div className="flex-1 w-full space-y-1.5">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = stats.distribution[star] ?? 0;
          const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-2 text-xs">
              <span className="w-4 text-right text-[var(--color-text-secondary)] shrink-0">
                {star}
              </span>
              {/* Star icon */}
              <svg
                className="w-3 h-3 text-amber-400 shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {/* Bar */}
              <div className="flex-1 h-2 bg-[var(--color-neutral-200)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-8 text-right text-[var(--color-text-secondary)] shrink-0">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
