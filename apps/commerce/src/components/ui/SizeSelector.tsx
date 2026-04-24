'use client';

import { cn } from '@/lib/cn';

// Spec: Direction B — Size Selector
// 4-cell row, border 1.5px, radius 10
// Each cell: size label + micro stock text ("3 left" / "sold")
// Active: solid ink fill + ★ accent marker (Fit profile match)
// Out-of-stock: opacity 0.35
// Low stock (≤5): show count. Zero: disabled + "sold" label

export interface SizeOption {
  /** Size label displayed in cell (e.g. "L", "XL", "2XL") */
  label: string;
  /** Stock quantity */
  stock: number;
  /** Whether this size matches the hound's Fit profile */
  isFit?: boolean;
}

interface SizeSelectorProps {
  options: SizeOption[];
  value?: string;
  onChange: (label: string) => void;
  className?: string;
}

const LOW_STOCK_THRESHOLD = 5;

export function SizeSelector({ options, value, onChange, className }: SizeSelectorProps) {
  return (
    <div
      className={cn('grid gap-2', className)}
      style={{ gridTemplateColumns: `repeat(${Math.min(options.length, 4)}, 1fr)` }}
      role="group"
      aria-label="Size selection"
    >
      {options.map((option) => {
        const isSelected = value === option.label;
        const isSoldOut = option.stock === 0;
        const isLow = !isSoldOut && option.stock <= LOW_STOCK_THRESHOLD;

        return (
          <button
            key={option.label}
            type="button"
            onClick={() => !isSoldOut && onChange(option.label)}
            disabled={isSoldOut}
            aria-pressed={isSelected}
            aria-label={[
              `Size ${option.label}`,
              isSoldOut ? 'sold out' : isLow ? `${option.stock} left` : '',
              option.isFit ? 'recommended fit' : '',
            ].filter(Boolean).join(', ')}
            className={cn(
              'relative flex flex-col items-center justify-center py-2.5 min-h-[52px]',
              'rounded-[var(--radius-md)] border-[1.5px]',
              'transition-colors duration-150',
              isSelected
                ? 'bg-[var(--mz-ink)] border-[var(--mz-ink)] text-[var(--mz-bg)]'
                : isSoldOut
                  ? 'bg-[var(--mz-surface)] border-[var(--mz-line)] text-[var(--mz-ink-mute)] opacity-35 cursor-not-allowed'
                  : 'bg-[var(--mz-surface)] border-[var(--mz-line-strong)] text-[var(--mz-ink)] hover:border-[var(--mz-ink)]',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mz-ink)]',
            )}
          >
            {/* Fit marker — ★ accent dot in top-right corner */}
            {option.isFit && !isSoldOut && (
              <span
                aria-hidden="true"
                className={cn(
                  'absolute -top-1.5 -right-1.5',
                  'w-4 h-4 rounded-full',
                  'flex items-center justify-center',
                  'bg-[var(--mz-accent)] text-white text-[8px] font-bold',
                )}
              >
                ★
              </span>
            )}

            {/* Size label — Fraunces 14/500 would be ideal but size selector uses UI font */}
            <span className="text-[14px] font-medium leading-none">{option.label}</span>

            {/* Stock micro text */}
            {isSoldOut ? (
              <span className="text-[10px] mt-1 font-medium opacity-70 leading-none">sold</span>
            ) : isLow ? (
              <span
                className={cn(
                  'text-[10px] mt-1 font-medium leading-none',
                  isSelected ? 'opacity-70' : 'text-[var(--mz-ink-mute)]'
                )}
              >
                {option.stock} left
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
