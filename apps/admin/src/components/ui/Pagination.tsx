import Link from 'next/link';

interface PaginationProps {
  page: number;
  total: number;
  perPage: number;
  hasNext: boolean;
  buildHref: (page: number) => string;
}

export function Pagination({
  page,
  total,
  perPage,
  hasNext,
  buildHref,
}: PaginationProps) {
  if (total <= perPage) return null;

  return (
    <div className="flex items-center justify-between mt-4 text-sm text-[var(--color-text-secondary)]">
      <span>
        총 {total.toLocaleString()}건 · {page}페이지
      </span>
      <div className="flex gap-2">
        {page > 1 && (
          <Link
            href={buildHref(page - 1)}
            className="px-3 py-1.5 border border-[var(--color-border)] rounded-md hover:bg-[var(--color-surface-muted)] transition-colors"
          >
            이전
          </Link>
        )}
        {hasNext && (
          <Link
            href={buildHref(page + 1)}
            className="px-3 py-1.5 border border-[var(--color-border)] rounded-md hover:bg-[var(--color-surface-muted)] transition-colors"
          >
            다음
          </Link>
        )}
      </div>
    </div>
  );
}
