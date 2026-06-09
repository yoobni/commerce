export default function PostDetailLoading() {
  return (
    <div className="min-h-screen bg-[var(--mz-bg)]">
      {/* Article chapter */}
      <div className="max-w-2xl mx-auto px-6 md:px-8 pt-8 md:pt-14 pb-10 md:pb-14">
        {/* Back link */}
        <div className="h-4 w-24 bg-[var(--mz-bg-deep)] rounded animate-pulse mb-10 md:mb-14" />

        {/* Eyebrow */}
        <div className="h-3 w-16 bg-[var(--mz-bg-deep)] rounded animate-pulse mb-5" />

        {/* Title */}
        <div className="space-y-3 mb-8 md:mb-10">
          <div className="h-10 w-full bg-[var(--mz-bg-deep)] rounded animate-pulse" />
          <div className="h-10 w-2/3 bg-[var(--mz-bg-deep)] rounded animate-pulse" />
        </div>

        {/* Meta row + hairline */}
        <div className="flex items-center gap-3 pb-8 mb-10 md:mb-12 border-b border-[var(--mz-line)]">
          <div className="w-9 h-9 rounded-full bg-[var(--mz-bg-deep)] animate-pulse" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3.5 w-24 bg-[var(--mz-bg-deep)] rounded animate-pulse" />
            <div className="h-3 w-32 bg-[var(--mz-bg-deep)] rounded animate-pulse" />
          </div>
        </div>

        {/* Image */}
        <div className="aspect-[4/3] bg-[var(--mz-bg-deep)] rounded-[var(--radius-md)] animate-pulse mb-10 md:mb-12" />

        {/* Body lines */}
        <div className="space-y-3 mb-10 md:mb-12">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-4 bg-[var(--mz-bg-deep)] rounded animate-pulse"
              style={{ width: `${70 + (i % 3) * 10}%` }}
            />
          ))}
        </div>

        {/* Stats */}
        <div className="flex gap-5">
          <div className="h-3 w-16 bg-[var(--mz-bg-deep)] rounded animate-pulse" />
          <div className="h-3 w-16 bg-[var(--mz-bg-deep)] rounded animate-pulse" />
        </div>

        {/* Like button placeholder */}
        <div className="flex justify-center mt-10 md:mt-12">
          <div className="h-10 w-24 bg-[var(--mz-bg-deep)] rounded-[var(--radius-md)] animate-pulse" />
        </div>
      </div>

      {/* Comments chapter — bg-deep band */}
      <div className="bg-[var(--mz-bg-deep)] border-t border-[var(--mz-line)]">
        <div className="max-w-2xl mx-auto px-6 md:px-8 py-12 md:py-16 space-y-6">
          <div className="h-5 w-20 bg-[var(--mz-line-strong)]/30 rounded animate-pulse" />
          <div className="h-32 bg-[var(--mz-surface)] rounded-[var(--radius-md)] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
