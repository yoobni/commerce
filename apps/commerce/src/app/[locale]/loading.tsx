'use client';

// Streaming fallback — shown while page segment is loading
export default function Loading() {
  return (
    <div className="min-h-screen" aria-busy="true" aria-label="Loading">
      {/* Page-level skeleton */}
      <div className="h-16 skeleton w-full mb-8" />
      <div className="max-w-[1280px] mx-auto px-5 space-y-6">
        <div className="h-[480px] skeleton w-full rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[3/4] skeleton rounded-md" />
              <div className="h-4 skeleton rounded w-3/4" />
              <div className="h-4 skeleton rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
