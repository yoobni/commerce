import { cn } from '../lib/cn';

/**
 * Badge variants — per design guide:
 *   fit      → accent bg + white text + pill     — "★ FIT L"
 *   fitSoft  → accent-soft bg + accent-ink text  — "✓ FITS"
 *   new      → ink bg + bg text + pill           — "NEW"
 *   season   → bg-deep + ink text + pill         — "SS26"
 *   sale     → error bg + white                  — "SALE"
 *   soldOut  → ink-mute bg + white               — "SOLD OUT"
 *   success  → success bg + white                — status
 *   warning  → warning bg + white                — status
 *   default  → bg-deep + ink-soft                — generic
 */

export type BadgeVariant =
  | 'fit'
  | 'fitSoft'
  | 'new'
  | 'season'
  | 'sale'
  | 'soldOut'
  | 'success'
  | 'warning'
  | 'default';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const badgeVariantClasses: Record<BadgeVariant, string> = {
  fit:     'bg-[var(--mz-accent)] text-white rounded-[var(--mz-radius-pill,999px)] text-[9px] font-[700] tracking-[0.08em]',
  fitSoft: 'bg-[var(--mz-accent-soft)] text-[var(--mz-accent-ink)] rounded-[var(--mz-radius-pill,999px)]',
  new:     'bg-[var(--mz-ink)] text-[var(--mz-bg)] rounded-[var(--mz-radius-pill,999px)]',
  season:  'bg-[var(--mz-bg-deep)] text-[var(--mz-ink)] rounded-[var(--mz-radius-pill,999px)]',
  sale:    'bg-[var(--mz-error,#c0392b)] text-white rounded-[var(--mz-radius-sm,4px)]',
  soldOut: 'bg-[var(--mz-ink-mute)] text-white rounded-[var(--mz-radius-sm,4px)]',
  success: 'bg-[var(--mz-success,#27ae60)] text-white rounded-[var(--mz-radius-sm,4px)]',
  warning: 'bg-[var(--mz-warning,#d68910)] text-white rounded-[var(--mz-radius-sm,4px)]',
  default: 'bg-[var(--mz-bg-deep)] text-[var(--mz-ink-soft)] rounded-[var(--mz-radius-sm,4px)]',
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5',
        'text-[10px] font-semibold tracking-wide uppercase',
        'max-w-full truncate whitespace-nowrap',
        badgeVariantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// ─── FitBadge ─────────────────────────────────────────────────────────────────
// Convenience for "★ FIT L" badge

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
        'inline-flex items-center gap-1 px-2.5 py-1',
        'rounded-[var(--mz-radius-pill,999px)]',
        'bg-[var(--mz-bg-deep)] text-[var(--mz-ink-soft)]',
        'border border-[var(--mz-line)]',
        'text-sm max-w-full',
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
            <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </span>
  );
}
