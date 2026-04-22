export default function OrdersLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        <div className="h-8 w-40 bg-[var(--color-neutral-200)] rounded mb-6 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] p-4 animate-pulse"
            >
              <div className="flex justify-between mb-3">
                <div className="space-y-1.5">
                  <div className="h-3 w-36 bg-[var(--color-neutral-100)] rounded" />
                  <div className="h-3 w-24 bg-[var(--color-neutral-100)] rounded" />
                </div>
                <div className="h-5 w-20 bg-[var(--color-neutral-100)] rounded" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-lg bg-[var(--color-neutral-100)] shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-[var(--color-neutral-100)] rounded" />
                  <div className="h-3 w-1/2 bg-[var(--color-neutral-100)] rounded" />
                </div>
                <div className="h-5 w-24 bg-[var(--color-neutral-100)] rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
