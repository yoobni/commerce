import Link from 'next/link';
import { cn } from '@/lib/cn';

interface PaginationProps {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
  labels: {
    prev: string;
    next: string;
    pageOf: string;
  };
}

export function Pagination({ page, totalPages, buildHref, labels }: PaginationProps) {
  if (totalPages <= 1) return null;

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  // Build a compact page window: [1] ... [page-1] [page] [page+1] ... [last]
  const pageNumbers: (number | '...')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pageNumbers.push(i);
    } else if (pageNumbers[pageNumbers.length - 1] !== '...') {
      pageNumbers.push('...');
    }
  }

  const pageLabel = labels.pageOf
    .replace('{page}', String(page))
    .replace('{total}', String(totalPages));

  return (
    <nav
      className="flex items-center justify-between mt-10 md:mt-12"
      aria-label="Pagination"
    >
      {/* Prev */}
      {hasPrev ? (
        <Link
          href={buildHref(page - 1)}
          className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-accent)] rounded"
          aria-label={labels.prev}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          {labels.prev}
        </Link>
      ) : (
        <span className="flex items-center gap-1.5 text-sm text-[var(--color-text-tertiary)] cursor-not-allowed" aria-disabled="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          {labels.prev}
        </span>
      )}

      {/* Page numbers (desktop) */}
      <div className="hidden sm:flex items-center gap-1" aria-label={pageLabel}>
        {pageNumbers.map((num, idx) =>
          num === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-sm text-[var(--color-text-tertiary)]">
              …
            </span>
          ) : (
            <Link
              key={num}
              href={buildHref(num)}
              aria-current={num === page ? 'page' : undefined}
              className={cn(
                'w-9 h-9 flex items-center justify-center text-sm rounded transition-colors duration-150',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-brand-accent)]',
                num === page
                  ? 'bg-[var(--color-brand-primary)] text-white font-medium cursor-default'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-text-primary)]'
              )}
            >
              {num}
            </Link>
          )
        )}
      </div>

      {/* Mobile: page x of y */}
      <span className="sm:hidden text-sm text-[var(--color-text-secondary)]">{pageLabel}</span>

      {/* Next */}
      {hasNext ? (
        <Link
          href={buildHref(page + 1)}
          className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-accent)] rounded"
          aria-label={labels.next}
        >
          {labels.next}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      ) : (
        <span className="flex items-center gap-1.5 text-sm text-[var(--color-text-tertiary)] cursor-not-allowed" aria-disabled="true">
          {labels.next}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </span>
      )}
    </nav>
  );
}
