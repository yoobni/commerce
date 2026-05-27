/**
 * DataTable — 어드민 list 화면에서 빈번하게 쓰이는 패턴을 묶음.
 * - 헤더/바디/푸터 구조
 * - 빈 상태(empty) / 로딩(loading skeleton) 자동 처리
 * - 푸터 슬롯에 페이지네이션 직접 배치
 *
 * 컬럼 정의는 React Table 같은 라이브러리 없이 단순한 객체 배열로 가벼움 유지.
 * 정렬/필터 같은 고급 기능은 페이지에서 직접 처리.
 *
 * Note: 'use client' 없음 — 서버/클라이언트 양쪽에서 import 가능.
 * onRowClick은 호출 측이 client component일 때만 동작.
 */

import * as React from 'react';
import { cn } from '@/lib/cn';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from './table';
import { Skeleton } from './skeleton';

export interface DataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  cell: (row: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string | number;
  loading?: boolean;
  loadingRows?: number;
  empty?: React.ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
  footer?: React.ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  loadingRows = 5,
  empty,
  onRowClick,
  className,
  footer,
}: DataTableProps<T>) {
  const alignClass = (a: DataTableColumn<T>['align']) =>
    a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left';

  return (
    <div className={cn('rounded-lg border border-border bg-card', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.key}
                style={col.width ? { width: col.width } : undefined}
                className={cn(alignClass(col.align), col.className)}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: loadingRows }).map((_, i) => (
              <TableRow key={`loading-${i}`}>
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    <Skeleton className="h-4 w-full max-w-[180px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                {empty ?? '데이터가 없습니다.'}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => (
              <TableRow
                key={rowKey(row, index)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={onRowClick ? 'cursor-pointer' : undefined}
              >
                {columns.map((col) => (
                  <TableCell key={col.key} className={cn(alignClass(col.align), col.className)}>
                    {col.cell(row, index)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {footer && <div className="flex items-center justify-between border-t border-border px-4 py-3">{footer}</div>}
    </div>
  );
}
