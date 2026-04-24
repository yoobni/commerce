'use client';

import { cn } from '@/lib/cn';

// Spec: Direction B — Chip
// Unselected: bg surface, border 1px line, radius pill, Inter 500/12, padding 7/14
// Selected:   bg ink, fg bg, border ink
// fit variant: bg accentSoft, fg accentInk — with ★ prefix

export type ChipVariant = 'default' | 'fit';

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  variant?: ChipVariant;
  children: React.ReactNode;
}

export function Chip({
  selected = false,
  variant = 'default',
  children,
  className,
  disabled,
  ...props
}: ChipProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1 px-3.5 py-[7px]',
        'rounded-[var(--radius-pill)] text-[12px] font-medium',
        'border transition-colors duration-150 whitespace-nowrap select-none',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mz-ink)]',
        variant === 'fit'
          ? selected
            ? 'bg-[var(--mz-accent)] border-[var(--mz-accent)] text-white'
            : 'bg-[var(--mz-accent-soft)] border-[var(--mz-accent-soft)] text-[var(--mz-accent-ink)] hover:border-[var(--mz-accent)]'
          : selected
            ? 'bg-[var(--mz-ink)] border-[var(--mz-ink)] text-[var(--mz-bg)]'
            : 'bg-[var(--mz-surface)] border-[var(--mz-line-strong)] text-[var(--mz-ink)] hover:border-[var(--mz-ink)]',
        disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
        className
      )}
      {...props}
    >
      {variant === 'fit' && <span aria-hidden="true">★</span>}
      {children}
    </button>
  );
}

// ─── ChipGroup ────────────────────────────────────────────────────────────────
// Scrollable row of chips for filter strips

interface ChipGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function ChipGroup({ children, className }: ChipGroupProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 overflow-x-auto',
        'scrollbar-none [-webkit-overflow-scrolling:touch]',
        'pb-px', // prevents clipping of focus rings
        className
      )}
      role="group"
    >
      {children}
    </div>
  );
}
