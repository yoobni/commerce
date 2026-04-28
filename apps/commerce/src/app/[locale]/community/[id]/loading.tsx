export default function PostDetailLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        <div className="h-4 w-24 bg-[var(--color-neutral-200)] rounded animate-pulse mb-6" />

        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[var(--color-border-subtle)] mb-6 space-y-4">
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-[var(--color-neutral-100)] rounded-full animate-pulse" />
          </div>
          <div className="h-7 w-3/4 bg-[var(--color-neutral-200)] rounded animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--color-neutral-200)] animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-24 bg-[var(--color-neutral-200)] rounded animate-pulse" />
              <div className="h-3 w-16 bg-[var(--color-neutral-100)] rounded animate-pulse" />
            </div>
          </div>
          <div className="aspect-[4/3] bg-[var(--color-neutral-100)] rounded-2xl animate-pulse" />
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-4 bg-[var(--color-neutral-100)] rounded animate-pulse"
                style={{ width: `${70 + (i % 3) * 10}%` }}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[var(--color-border-subtle)] space-y-4">
          <div className="h-5 w-20 bg-[var(--color-neutral-200)] rounded animate-pulse" />
          <div className="h-24 bg-[var(--color-neutral-100)] rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
