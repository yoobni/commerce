import { Container } from '@/components/layout/Container';
import { ProductGridSkeleton, Skeleton } from '@/components/ui/Skeleton';

export default function SearchLoading() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <Container className="py-8 md:py-12">
        {/* Search input skeleton */}
        <div className="mb-8 max-w-xl">
          <Skeleton className="h-[42px] w-full rounded" />
        </div>
        {/* Results header skeleton */}
        <div className="mb-6 space-y-1">
          <Skeleton className="h-6 w-64 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
        {/* Grid skeleton */}
        <ProductGridSkeleton count={10} />
      </Container>
    </main>
  );
}
