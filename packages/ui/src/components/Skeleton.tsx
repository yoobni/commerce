import { cn } from '../lib/cn';

export type SkeletonVariant = 'text' | 'rect' | 'circle';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  lines?: number;
  className?: string;
}

export function Skeleton({
  variant = 'rect',
  width,
  height,
  lines = 1,
  className,
}: SkeletonProps) {
  const baseClasses = cn(
    'block bg-[var(--mz-bg-deep)]',
    'rounded-[var(--mz-radius-sm,4px)]'
  );

  const inlineStyle: React.CSSProperties = {
    width:  width  !== undefined ? (typeof width  === 'number' ? `${width}px`  : width)  : undefined,
    height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined,
    animation: 'mz-skeleton-pulse 1.6s ease-in-out infinite',
  };

  if (variant === 'circle') {
    return (
      <span
        className={cn(baseClasses, 'rounded-full', className)}
        style={inlineStyle}
        aria-hidden="true"
      />
    );
  }

  if (variant === 'text' && lines > 1) {
    return (
      <span className="flex flex-col gap-2" aria-hidden="true">
        {Array.from({ length: lines }).map((_, i) => (
          <span
            key={i}
            className={cn(baseClasses, 'h-4', className)}
            style={{
              ...inlineStyle,
              width: i === lines - 1 ? '66%' : (width !== undefined ? inlineStyle.width : '100%'),
            }}
          />
        ))}
      </span>
    );
  }

  return (
    <span
      className={cn(
        baseClasses,
        variant === 'text' ? 'h-4 w-full' : '',
        className
      )}
      style={inlineStyle}
      aria-hidden="true"
    />
  );
}

// ─── Product Card Skeleton ─────────────────────────────────────────────────────

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2', className)} aria-hidden="true">
      <Skeleton variant="rect" className="w-full aspect-square rounded-[var(--mz-radius-md,10px)]" />
      <Skeleton variant="text" width="80%" height={14} />
      <Skeleton variant="text" width="50%" height={12} />
      <Skeleton variant="text" width="40%" height={16} />
    </div>
  );
}

// ─── Text block skeleton ───────────────────────────────────────────────────────

export function TextSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  return <Skeleton variant="text" lines={lines} className={className} />;
}
