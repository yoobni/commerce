import { cn } from '@/lib/cn';

type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'purple'
  | 'accent';

const variantStyles: Record<BadgeVariant, string> = {
  success:
    'bg-[var(--color-success-surface)] text-[var(--color-success)]',
  warning:
    'bg-[var(--color-warning-surface)] text-[var(--color-warning)]',
  danger:
    'bg-[var(--color-error-surface)] text-[var(--color-error)]',
  info:
    'bg-[var(--color-info-surface)] text-[var(--color-info)]',
  neutral:
    'bg-[var(--color-neutral-surface)] text-[var(--color-neutral)]',
  purple:
    'bg-purple-50 text-purple-700',
  accent:
    'bg-amber-50 text-amber-700',
};

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

export function Badge({ variant = 'neutral', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
