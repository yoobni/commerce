import { cn } from '@/lib/cn';

// ─── Badge ────────────────────────────────────────────────────────────────────

export type BadgeVariant = 'new' | 'sale' | 'soldOut' | 'lowStock' | 'default';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const badgeVariantClasses: Record<BadgeVariant, string> = {
  new: 'bg-[var(--color-success)] text-white',
  sale: 'bg-[var(--color-error)] text-white',
  soldOut: 'bg-[var(--color-neutral-400)] text-white',
  lowStock: 'bg-[var(--color-warning)] text-white',
  default: 'bg-[var(--color-neutral-200)] text-[var(--color-text-primary)]',
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold tracking-wide uppercase max-w-full truncate',
        badgeVariantClasses[variant],
        className
      )}
    >
      {children}
    </span>
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
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm',
        'bg-[var(--color-neutral-100)] text-[var(--color-text-secondary)]',
        'border border-[var(--color-border)] max-w-full',
        className
      )}
    >
      <span className="truncate">{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove tag"
          className="shrink-0 rounded-full w-4 h-4 flex items-center justify-center hover:bg-[var(--color-neutral-200)] transition-colors"
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
            <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </span>
  );
}
