/**
 * Pagination — link-based page navigator (no client state).
 *
 * Design guide:
 *   <Pagination page={2} total={120} perPage={20} buildUrl={(p) => `/orders?page=${p}`} />
 *
 * Renders: « prev  [2 of 6]  next »
 * Hidden when there is only one page.
 */

import Link from 'next/link';

interface PaginationProps {
  page: number;
  total: number;
  perPage: number;
  buildUrl: (page: number) => string;
}

export function Pagination({ page, total, perPage, buildUrl }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  if (totalPages <= 1) return null;

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav
      className="flex items-center justify-between mt-4 text-sm"
      aria-label="페이지 내비게이션"
    >
      <span className="text-[var(--color-text-secondary)]">
        총 <span className="font-medium text-[var(--color-text-primary)]">{total.toLocaleString()}</span>건
        &nbsp;·&nbsp;
        {page} / {totalPages} 페이지
      </span>

      <div className="flex items-center gap-1">
        <PaginationLink
          href={hasPrev ? buildUrl(page - 1) : undefined}
          aria-label="이전 페이지"
        >
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" aria-hidden="true">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </PaginationLink>

        <PaginationLink
          href={hasNext ? buildUrl(page + 1) : undefined}
          aria-label="다음 페이지"
        >
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" aria-hidden="true">
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </PaginationLink>
      </div>
    </nav>
  );
}

function PaginationLink({
  href,
  children,
  'aria-label': ariaLabel,
}: {
  href?: string;
  children: React.ReactNode;
  'aria-label': string;
}) {
  const base =
    'flex items-center justify-center w-8 h-8 rounded border border-[var(--color-border)] transition-colors';
  const active = 'hover:bg-gray-50 text-[var(--color-text-primary)]';
  const disabled = 'text-[var(--color-text-tertiary)] pointer-events-none opacity-40';

  if (!href) {
    return (
      <span className={`${base} ${disabled}`} aria-disabled="true" aria-label={ariaLabel}>
        {children}
      </span>
    );
  }

  return (
    <Link href={href} className={`${base} ${active}`} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}
