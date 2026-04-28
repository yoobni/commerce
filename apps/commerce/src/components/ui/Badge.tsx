import { cn } from '@/lib/cn';

// ─── Badge ────────────────────────────────────────────────────────────────────
// Added: `fit` variant — Fit-for-Hana badge (★ FIT L)
// Spec: pill, accent bg (#6B2020), white text, 9px/700/+0.08em

export type BadgeVariant = 'new' | 'sale' | 'soldOut' | 'lowStock' | 'fit' | 'default';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const badgeVariantClasses: Record<BadgeVariant, string> = {
  fit: 'bg-[var(--mz-accent)] text-white rounded-[var(--radius-pill)] text-[9px] font-[700] tracking-[0.08em]',
  new: 'bg-[var(--color-success)] text-white',
  sale: 'bg-[var(--color-error)] text-white',
  soldOut: 'bg-[var(--mz-ink-mute)] text-white',
  lowStock: 'bg-[var(--color-warning)] text-white',
  default: 'bg-[var(--mz-bg-deep)] text-[var(--mz-ink-soft)]',
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase max-w-full truncate',
        variant !== 'fit' && 'rounded',
        badgeVariantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// ─── FitBadge ─────────────────────────────────────────────────────────────────
// Convenience wrapper for Fit-for-Hana badge: "★ FIT L"

export function FitBadge({ size, className }: { size: string; className?: string }) {
  return (
    <Badge variant="fit" className={className}>
      ★ FIT {size}
    </Badge>
  );
}

// ─── Tag ─────────────────────────────────────────────────────────────────────

export interface TagProps {
  children: React.ReactNode;
  onRemove?: () => void;
  className?: string;
}

export function Tag({ children, onRemove, className }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius-pill)] text-sm',
        'bg-[var(--mz-bg-deep)] text-[var(--mz-ink-soft)]',
        'border border-[var(--mz-line)] max-w-full',
        className
      )}
    >
      <span className="truncate">{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove tag"
          className="shrink-0 rounded-full w-4 h-4 flex items-center justify-center hover:bg-[var(--mz-line-strong)] transition-colors"
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
            <path
              d="M1 1l6 6M7 1L1 7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </span>
  );
}
