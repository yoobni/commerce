/**
 * DataTablePagination — list 화면 footer에 들어가는 표준 페이지네이션 블록.
 * DataTable footer prop에 그대로 넣으면 됨.
 *
 * Example:
 *   <DataTable footer={<DataTablePagination page={page} total={total} perPage={20} buildHref={(p) => `?page=${p}`} unit="건" />} />
 */
import * as React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination';

export interface DataTablePaginationProps {
  page: number;
  total: number;
  perPage: number;
  buildHref: (page: number) => string;
  /** 표시 단위 (건, 명, 개 등). 없으면 숫자만. */
  unit?: string;
  /** "N건 표시 · 총 M건"의 N — 기본은 perPage. */
  displayed?: number;
}

function buildPageItems(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: Array<number | 'ellipsis'> = [];
  items.push(1);
  if (current > 4) items.push('ellipsis');
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    items.push(p);
  }
  if (current < total - 3) items.push('ellipsis');
  items.push(total);
  return items;
}

export function DataTablePagination({
  page,
  total,
  perPage,
  buildHref,
  unit = '',
  displayed,
}: DataTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  if (totalPages <= 1) return null;
  const shown = displayed ?? Math.min(perPage, total);
  const unitText = unit ? unit : '';

  return (
    <>
      <span className="text-[12.5px] text-muted-foreground">
        {shown}
        {unitText} 표시 · 총 {total.toLocaleString()}
        {unitText}
      </span>
      <Pagination className="m-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            {page > 1 ? (
              <PaginationPrevious href={buildHref(page - 1)} />
            ) : (
              <span className="pointer-events-none opacity-40">
                <PaginationPrevious href="#" />
              </span>
            )}
          </PaginationItem>
          {buildPageItems(page, totalPages).map((it, i) =>
            it === 'ellipsis' ? (
              <PaginationItem key={`e-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={it}>
                <PaginationLink href={buildHref(it)} isActive={it === page}>
                  {it}
                </PaginationLink>
              </PaginationItem>
            ),
          )}
          <PaginationItem>
            {page < totalPages ? (
              <PaginationNext href={buildHref(page + 1)} />
            ) : (
              <span className="pointer-events-none opacity-40">
                <PaginationNext href="#" />
              </span>
            )}
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  );
}
