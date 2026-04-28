import { cn } from '@/lib/cn';
import { Button } from './Button';

// ─── Section-level error block ────────────────────────────────────────────────

export interface ErrorBlockProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorBlock({
  message = 'Something went wrong.',
  onRetry,
  className,
}: ErrorBlockProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 min-h-[120px] py-8 px-6 text-center',
        'rounded-lg border border-[var(--color-border)] bg-[var(--color-neutral-50)]',
        className
      )}
    >
      <WarningIcon />
      <p className="text-sm text-[var(--color-text-secondary)]">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

function WarningIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-[var(--color-warning)]"
      aria-hidden="true"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

// ─── Inline field error ───────────────────────────────────────────────────────

export function InlineError({ message, id }: { message: string; id?: string }) {
  return (
    <p id={id} role="alert" className="text-xs text-[var(--color-error)] mt-1">
      {message}
    </p>
  );
}

// ─── Network error ────────────────────────────────────────────────────────────

export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return <ErrorBlock message="Check your internet connection and try again." onRetry={onRetry} />;
}
