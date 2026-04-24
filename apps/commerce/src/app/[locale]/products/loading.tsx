import { Container } from '@/components/layout/Container';
import { ProductGridSkeleton, Skeleton } from '@/components/ui/Skeleton';

export default function ProductsLoading() {
  return (
    <div className="bg-[var(--color-bg)] min-h-screen">
      <Container className="py-8 md:py-12">
        {/* Title skeleton */}
        <div className="mb-6 space-y-2">
          <Skeleton className="h-8 w-40 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>

        <div className="flex gap-8">
          {/* Sidebar skeleton */}
          <div className="hidden lg:block w-56 shrink-0 space-y-7">
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded" />
              ))}
            </div>
          </div>

          {/* Grid skeleton */}
          <div className="flex-1">
            <ProductGridSkeleton count={12} />
          </div>
        </div>
      </Container>
    </div>
  );
}
