export default function OrderDetailLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-6 animate-pulse">
        {/* Back link skeleton */}
        <div className="h-4 w-28 bg-[var(--color-neutral-200)] rounded" />

        {/* Header */}
        <div className="space-y-2">
          <div className="h-6 w-48 bg-[var(--color-neutral-200)] rounded" />
          <div className="h-4 w-32 bg-[var(--color-neutral-100)] rounded" />
        </div>

        {/* Timeline skeleton */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-[var(--color-border)]">
          <div className="h-4 w-24 bg-[var(--color-neutral-100)] rounded mb-4" />
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-[var(--color-neutral-100)]" />
                <div className="h-2 w-full max-w-12 bg-[var(--color-neutral-100)] rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Items skeleton */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-[var(--color-border)] space-y-4">
          <div className="h-4 w-24 bg-[var(--color-neutral-100)] rounded" />
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-20 h-20 rounded-lg bg-[var(--color-neutral-100)] shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 w-3/4 bg-[var(--color-neutral-100)] rounded" />
                <div className="h-3 w-1/2 bg-[var(--color-neutral-100)] rounded" />
                <div className="h-4 w-1/4 bg-[var(--color-neutral-100)] rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Summary skeleton */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-[var(--color-border)] space-y-3">
          <div className="h-4 w-24 bg-[var(--color-neutral-100)] rounded" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-3 w-24 bg-[var(--color-neutral-100)] rounded" />
              <div className="h-3 w-16 bg-[var(--color-neutral-100)] rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
