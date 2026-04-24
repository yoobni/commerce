import { Container } from '@/components/layout/Container';
import { ProductGridSkeleton, Skeleton } from '@/components/ui/Skeleton';

export default function ProductsLoading() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <Container className="py-8 md:py-12">
        {/* Header skeleton */}
        <div className="mb-6 space-y-2">
          <Skeleton className="h-8 w-40 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:gap-8">
          {/* Sidebar skeleton */}
          <aside className="w-full md:w-56 md:shrink-0 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-16 rounded" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 4 }).map((__, j) => (
                    <Skeleton key={j} className="h-8 w-12 rounded-full" />
                  ))}
                </div>
              </div>
            ))}
          </aside>

          {/* Grid skeleton */}
          <div className="flex-1">
            <ProductGridSkeleton count={12} />
          </div>
        </div>
      </Container>
    </main>
  );
}
