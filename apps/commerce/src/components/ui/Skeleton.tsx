import { cn } from '@/lib/cn';

// ─── Base Skeleton ────────────────────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton', className)} aria-hidden="true" />;
}

// ─── ProductCard Skeleton ─────────────────────────────────────────────────────

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-0" aria-hidden="true">
      <Skeleton className="aspect-square w-full rounded-[var(--radius-md)]" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-3 w-1/3 rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-2/3 rounded" />
        <Skeleton className="h-5 w-1/4 rounded" />
      </div>
    </div>
  );
}

// ─── ProductGrid Skeleton ─────────────────────────────────────────────────────

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5"
      aria-label="Loading products"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── ReviewCard Skeleton ──────────────────────────────────────────────────────

export function ReviewCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4" aria-hidden="true">
      <div className="flex items-center gap-3">
        <Skeleton className="w-9 h-9 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-3/4 rounded" />
      </div>
    </div>
  );
}

// ─── CommunityCard Skeleton ───────────────────────────────────────────────────

export function CommunityCardSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      <Skeleton className="aspect-square w-full rounded-md" />
      <div className="flex items-center gap-2">
        <Skeleton className="w-7 h-7 rounded-full" />
        <Skeleton className="h-3 w-20 rounded" />
      </div>
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-2/3 rounded" />
      </div>
    </div>
  );
}

// ─── Text Skeleton ────────────────────────────────────────────────────────────

export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  const widths = ['w-full', 'w-5/6', 'w-3/4', 'w-full', 'w-4/5'];
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-4 rounded', widths[i % widths.length])} />
      ))}
    </div>
  );
}
