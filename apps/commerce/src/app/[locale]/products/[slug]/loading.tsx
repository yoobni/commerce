import { Container, Page } from '@/components/layout/Container';
import { Skeleton } from '@/components/ui/Skeleton';

export default function ProductDetailLoading() {
  return (
    <Page>
      <Container className="pt-6 pb-16 md:pt-8">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-4 w-10 rounded" />
          <Skeleton className="h-4 w-2 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-4 w-2 rounded" />
          <Skeleton className="h-4 w-32 rounded" />
        </div>

        {/* Main grid */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Gallery skeleton */}
          <div className="flex flex-col gap-3 md:flex-row-reverse md:gap-4">
            <Skeleton className="flex-1 aspect-square rounded-lg" />
            <div className="flex flex-row gap-2 md:flex-col md:w-[72px]">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="shrink-0 w-16 h-16 md:w-full md:h-[72px] rounded" />
              ))}
            </div>
          </div>

          {/* Info skeleton */}
          <div className="mt-8 lg:mt-0 space-y-4">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-8 w-4/5 rounded" />
            <Skeleton className="h-8 w-3/5 rounded" />
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="w-3.5 h-3.5 rounded-sm" />
              ))}
              <Skeleton className="h-3.5 w-12 rounded ml-1" />
            </div>
            <Skeleton className="h-8 w-28 rounded mt-4" />

            {/* Color swatches */}
            <div className="pt-6 space-y-3">
              <Skeleton className="h-4 w-24 rounded" />
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="w-8 h-8 rounded-full" />
                ))}
              </div>
            </div>

            {/* Size buttons */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-20 rounded" />
              <div className="flex gap-2">
                {['S', 'M', 'L', 'XL', '2XL'].map((s) => (
                  <Skeleton key={s} className="h-11 w-14 rounded" />
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-[52px] flex-1 rounded" />
              <Skeleton className="h-[52px] w-[52px] rounded" />
            </div>
          </div>
        </div>
      </Container>
    </Page>
  );
}
