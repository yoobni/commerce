import { cn } from '@/lib/cn';

interface RatingStarsProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

/** Read-only star rating display. Supports fractional fill. */
export function RatingStars({ rating, max = 5, size = 'md', className }: RatingStarsProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)} aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => {
        const filled = Math.min(Math.max(rating - i, 0), 1);
        return (
          <StarIcon key={i} fill={filled} className={SIZE_CLASSES[size]} />
        );
      })}
    </div>
  );
}

function StarIcon({ fill, className }: { fill: number; className: string }) {
  const id = `star-grad-${Math.random().toString(36).slice(2)}`;
  if (fill >= 1) {
    return (
      <svg className={cn(className, 'text-amber-400')} viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    );
  }
  if (fill <= 0) {
    return (
      <svg className={cn(className, 'text-neutral-200')} viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    );
  }
  // Partial fill via SVG gradient
  return (
    <svg className={className} viewBox="0 0 20 20">
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill * 100}%`} stopColor="#fbbf24" />
          <stop offset={`${fill * 100}%`} stopColor="#e5e7eb" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
      />
    </svg>
  );
}

// ─── Interactive Input ─────────────────────────────────────────────────────────

interface RatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  max?: number;
  size?: 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

/** Interactive star rating selector. */
export function RatingInput({
  value,
  onChange,
  max = 5,
  size = 'lg',
  className,
  disabled = false,
}: RatingInputProps) {
  const sizeClass = size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';

  return (
    <div className={cn('flex items-center gap-1', className)} role="radiogroup">
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= value;
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={starValue === value}
            aria-label={`${starValue} star`}
            disabled={disabled}
            onClick={() => onChange(starValue)}
            className={cn(
              'transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded',
              disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110 active:scale-95'
            )}
          >
            <svg
              className={cn(sizeClass, isFilled ? 'text-amber-400' : 'text-neutral-200')}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
