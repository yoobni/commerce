import { Container, Page } from '@/components/layout/Container';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { Skeleton } from '@/components/ui/Skeleton';

export default function ProductsLoading() {
  return (
    <Page>
      <Container className="pt-6 pb-16 md:pt-8">
        {/* Title skeleton */}
        <Skeleton className="h-8 w-32 rounded mb-6" />

        {/* Category nav skeleton */}
        <div className="flex gap-2 mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-full shrink-0" />
          ))}
        </div>

        {/* Toolbar skeleton */}
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-9 w-24 rounded" />
          <Skeleton className="h-9 w-40 rounded" />
        </div>

        {/* Grid skeleton */}
        <div className="flex gap-8">
          {/* Sidebar skeleton (desktop) */}
          <div className="w-56 shrink-0 hidden lg:flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3 py-4 border-b border-[var(--color-border-subtle)]">
                <Skeleton className="h-4 w-20 rounded" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className="w-10 h-10 rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex-1 min-w-0">
            <ProductGridSkeleton count={20} />
          </div>
        </div>
      </Container>
    </Page>
  );
}
