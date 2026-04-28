import { cn } from '@/lib/cn';

export type CardVariant = 'default' | 'elevated' | 'flat' | 'outlined';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  /** Remove default padding */
  noPadding?: boolean;
  /** Render as a pressable/clickable surface */
  interactive?: boolean;
  as?: 'div' | 'article' | 'section' | 'li';
}

const variantClasses: Record<CardVariant, string> = {
  default:
    'bg-[var(--mz-surface)] border border-[var(--mz-line)] rounded-[var(--radius-lg)]',
  elevated:
    'bg-[var(--mz-surface)] rounded-[var(--radius-lg)] shadow-[0_2px_12px_rgba(14,14,12,0.08)]',
  flat: 'bg-[var(--mz-bg-deep)] rounded-[var(--radius-lg)]',
  outlined:
    'bg-transparent border border-[var(--mz-line-strong)] rounded-[var(--radius-lg)]',
};

export function Card({
  variant = 'default',
  noPadding = false,
  interactive = false,
  as: Tag = 'div',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <Tag
      className={cn(
        variantClasses[variant],
        !noPadding && 'p-5',
        interactive &&
          'cursor-pointer transition-[box-shadow,transform] duration-150 hover:shadow-[0_4px_16px_rgba(14,14,12,0.10)] active:scale-[0.99]',
        className
      )}
      {...(props as React.HTMLAttributes<HTMLElement>)}
    >
      {children}
    </Tag>
  );
}

// ─── Composition helpers ──────────────────────────────────────────────────────

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center justify-between pb-4 mb-4 border-b border-[var(--mz-line)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'font-["Fraunces"] text-[15px] font-[500] leading-[20px] text-[var(--mz-ink)]',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardBody({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('text-[13px] text-[var(--mz-ink-soft)] leading-[21px]', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 pt-4 mt-4 border-t border-[var(--mz-line)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
