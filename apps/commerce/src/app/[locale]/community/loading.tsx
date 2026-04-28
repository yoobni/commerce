export default function CommunityLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <div className="h-7 w-32 bg-[var(--color-neutral-200)] rounded animate-pulse" />
            <div className="h-4 w-24 bg-[var(--color-neutral-100)] rounded animate-pulse" />
          </div>
          <div className="h-9 w-24 bg-[var(--color-neutral-200)] rounded animate-pulse" />
        </div>

        {/* Search skeleton */}
        <div className="h-11 w-full bg-[var(--color-neutral-100)] rounded-xl mb-6 animate-pulse" />

        {/* Tab skeleton */}
        <div className="flex gap-2 mb-6">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-9 w-16 bg-[var(--color-neutral-100)] rounded-full animate-pulse"
            />
          ))}
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[var(--color-border-subtle)]"
            >
              <div className="aspect-[4/3] bg-[var(--color-neutral-100)] animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-3 w-20 bg-[var(--color-neutral-100)] rounded animate-pulse" />
                <div className="h-4 w-full bg-[var(--color-neutral-100)] rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-[var(--color-neutral-100)] rounded animate-pulse" />
                <div className="flex justify-between mt-3">
                  <div className="h-3 w-16 bg-[var(--color-neutral-100)] rounded animate-pulse" />
                  <div className="h-3 w-12 bg-[var(--color-neutral-100)] rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
