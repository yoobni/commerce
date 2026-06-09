export default function CommunityLoading() {
  return (
    <div className="min-h-screen bg-[var(--mz-bg)]">
      <div className="max-w-5xl mx-auto px-5 md:px-8 py-8 md:py-12">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <div className="h-7 w-32 bg-[var(--mz-bg-deep)] rounded animate-pulse" />
            <div className="h-4 w-24 bg-[var(--mz-bg-deep)] rounded animate-pulse" />
          </div>
          <div className="h-9 w-24 bg-[var(--mz-bg-deep)] rounded-[var(--radius-md)] animate-pulse" />
        </div>

        {/* Search skeleton */}
        <div className="h-12 w-full bg-[var(--mz-bg-deep)] rounded-[var(--radius-md)] mb-6 animate-pulse" />

        {/* Filter chip skeleton */}
        <div className="flex gap-2 mb-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-8 w-16 bg-[var(--mz-bg-deep)] rounded-[var(--radius-pill)] animate-pulse"
            />
          ))}
        </div>

        {/* Sort skeleton */}
        <div className="flex justify-end gap-2 mb-6">
          <div className="h-5 w-12 bg-[var(--mz-bg-deep)] rounded animate-pulse" />
          <div className="h-5 w-12 bg-[var(--mz-bg-deep)] rounded animate-pulse" />
        </div>

        {/* Grid skeleton — matches PostCard magazine layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-8 md:gap-x-4 md:gap-y-12 pb-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col">
              <div className="aspect-square bg-[var(--mz-bg-deep)] rounded-[var(--radius-md)] animate-pulse" />
              <div className="mt-3 flex flex-col gap-2">
                <div className="h-3 w-20 bg-[var(--mz-bg-deep)] rounded animate-pulse" />
                <div className="h-5 w-full bg-[var(--mz-bg-deep)] rounded animate-pulse" />
                <div className="h-5 w-3/4 bg-[var(--mz-bg-deep)] rounded animate-pulse" />
                <div className="flex justify-between mt-1">
                  <div className="h-3 w-20 bg-[var(--mz-bg-deep)] rounded animate-pulse" />
                  <div className="h-3 w-14 bg-[var(--mz-bg-deep)] rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
