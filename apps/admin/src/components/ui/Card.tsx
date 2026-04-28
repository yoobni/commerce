import { cn } from '@/lib/cn';

export interface AdminCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Remove default padding */
  noPadding?: boolean;
}

export function Card({ noPadding = false, className, children, ...props }: AdminCardProps) {
  return (
    <div className={cn('card', !noPadding && 'p-5', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center justify-between pb-4 mb-4 border-b border-[var(--color-border)]',
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
      className={cn('text-sm font-semibold text-[var(--color-text-primary)]', className)}
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
    <div
      className={cn('text-sm text-[var(--color-text-secondary)]', className)}
      {...props}
    >
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
        'flex items-center justify-end gap-2 pt-4 mt-4 border-t border-[var(--color-border)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
