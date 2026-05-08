import { cn } from '../lib/cn';

/**
 * Card variants:
 *   default  — surface bg, 1px line border, radius-lg
 *   elevated — surface bg, shadow, radius-lg
 *   outlined — transparent bg, 1px lineStrong border, radius-lg
 *   ghost    — bg-deep, no border, radius-lg
 */

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'ghost';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  as?: React.ElementType;
}

const variantClasses: Record<CardVariant, string> = {
  default:  'bg-[var(--mz-surface)] border border-[var(--mz-line)]',
  elevated: 'bg-[var(--mz-surface)] shadow-[0_2px_12px_rgba(14,14,12,0.08)]',
  outlined: 'bg-transparent border border-[var(--mz-line-strong)]',
  ghost:    'bg-[var(--mz-bg-deep)]',
};

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm:   'p-3',
  md:   'p-4',
  lg:   'p-6',
};

export function Card({
  variant = 'default',
  padding = 'md',
  as: As = 'div',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <As
      className={cn(
        'rounded-[var(--mz-radius-lg,16px)]',
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </As>
  );
}

// ─── Card sub-components ──────────────────────────────────────────────────────

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col gap-1 mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('font-[var(--mz-font-serif,serif)] text-[15px] font-[500] text-[var(--mz-ink)]', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-[13px] text-[var(--mz-ink-mute)]', className)} {...props}>
      {children}
    </p>
  );
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center mt-4 pt-4 border-t border-[var(--mz-line)]', className)}
      {...props}
    >
      {children}
    </div>
  );
}
