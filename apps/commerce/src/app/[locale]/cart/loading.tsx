import { Skeleton } from '@/components/ui/Skeleton';

export default function CartLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <Skeleton className="h-8 w-40 rounded mb-8" aria-hidden="true" />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
          {/* Items skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 flex gap-4 shadow-sm">
                <Skeleton className="w-24 h-24 md:w-28 md:h-28 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <Skeleton className="h-3 w-1/4 rounded" />
                  <Skeleton className="h-5 w-2/3 rounded" />
                  <Skeleton className="h-4 w-1/3 rounded" />
                  <div className="flex items-center justify-between pt-2">
                    <Skeleton className="h-9 w-28 rounded" />
                    <Skeleton className="h-5 w-20 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary skeleton */}
          <div className="bg-white rounded-xl p-6 h-fit shadow-sm space-y-4">
            <Skeleton className="h-6 w-28 rounded" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-4 w-12 rounded" />
              </div>
              <div className="pt-3 border-t border-[var(--color-neutral-100)] flex justify-between">
                <Skeleton className="h-5 w-16 rounded" />
                <Skeleton className="h-5 w-20 rounded" />
              </div>
            </div>
            <Skeleton className="h-12 w-full rounded-lg mt-2" />
          </div>
        </div>
      </div>
    </div>
  );
}
