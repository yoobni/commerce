import { cn } from '@/lib/cn';
import { Button } from './Button';

export interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center min-h-[240px] py-12 px-6 gap-4',
        className
      )}
    >
      {icon ? (
        <div className="text-[var(--color-neutral-300)] mb-2">{icon}</div>
      ) : (
        <DogSilhouetteIcon />
      )}

      <div className="flex flex-col gap-2 max-w-xs">
        <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-[var(--color-text-secondary)]">
            {description}
          </p>
        )}
      </div>

      {action && (
        <Button
          variant="secondary"
          size="sm"
          onClick={action.onClick}
          className="mt-2"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

function DogSilhouetteIcon() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className="text-[var(--color-neutral-300)]"
    >
      {/* Simple large dog silhouette outline */}
      <ellipse cx="32" cy="38" rx="18" ry="14" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="32" cy="18" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
      {/* Ears */}
      <path d="M25 12 Q22 6 26 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M39 12 Q42 6 38 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Legs */}
      <line x1="22" y1="50" x2="20" y2="58" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="51" x2="27" y2="59" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="36" y1="51" x2="37" y2="59" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="42" y1="50" x2="44" y2="58" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Tail */}
      <path d="M50 36 Q56 30 52 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// ─── Preset empty states ──────────────────────────────────────────────────────

export function CartEmptyState({ onShop }: { onShop?: () => void }) {
  return (
    <EmptyState
      title="Your cart is empty"
      description="Add items to get started."
      action={onShop ? { label: 'Start Shopping', onClick: onShop } : undefined}
    />
  );
}

export function WishlistEmptyState({ onExplore }: { onExplore?: () => void }) {
  return (
    <EmptyState
      title="Your wishlist is empty"
      description="Save items you love."
      action={onExplore ? { label: 'Explore Products', onClick: onExplore } : undefined}
    />
  );
}

export function SearchEmptyState({ query }: { query: string }) {
  return (
    <EmptyState
      title={`No results for "${query}"`}
      description="Try different keywords or browse all products."
    />
  );
}

export function FilterEmptyState({ onReset }: { onReset?: () => void }) {
  return (
    <EmptyState
      title="No products match"
      description="Try removing some filters."
      action={onReset ? { label: 'Reset Filters', onClick: onReset } : undefined}
    />
  );
}
