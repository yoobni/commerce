'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortDirection = 'asc' | 'desc';

export interface TableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T, index: number) => React.ReactNode;
}

export interface TableProps<T extends { id: string | number }> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  /** Enable row selection with checkboxes */
  selectable?: boolean;
  selectedIds?: Set<string | number>;
  onSelectChange?: (ids: Set<string | number>) => void;
  onRowClick?: (row: T) => void;
  /** Controlled sort state */
  sortKey?: string;
  sortDirection?: SortDirection;
  onSortChange?: (key: string, direction: SortDirection) => void;
  className?: string;
  rowClassName?: (row: T) => string | undefined;
}

const SKELETON_ROWS = 5;

// ─── Component ────────────────────────────────────────────────────────────────

export function Table<T extends { id: string | number }>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data',
  selectable = false,
  selectedIds,
  onSelectChange,
  onRowClick,
  sortKey,
  sortDirection,
  onSortChange,
  className,
  rowClassName,
}: TableProps<T>) {
  const [internalSort, setInternalSort] = useState<{
    key: string;
    direction: SortDirection;
  } | null>(null);

  const activeSortKey = sortKey ?? internalSort?.key;
  const activeSortDir = sortDirection ?? internalSort?.direction;

  function handleSort(key: string) {
    const nextDir: SortDirection =
      activeSortKey === key && activeSortDir === 'asc' ? 'desc' : 'asc';
    if (onSortChange) {
      onSortChange(key, nextDir);
    } else {
      setInternalSort({ key, direction: nextDir });
    }
  }

  function handleSelectAll(checked: boolean) {
    if (!onSelectChange) return;
    if (checked) {
      onSelectChange(new Set(data.map((r) => r.id)));
    } else {
      onSelectChange(new Set());
    }
  }

  function handleSelectRow(id: string | number, checked: boolean) {
    if (!onSelectChange || !selectedIds) return;
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    onSelectChange(next);
  }

  const allSelected = selectedIds && data.length > 0 && selectedIds.size === data.length;
  const someSelected = selectedIds && selectedIds.size > 0 && !allSelected;

  // Client-side sort when uncontrolled
  const sortedData =
    !onSortChange && internalSort
      ? [...data].sort((a, b) => {
          const av = (a as Record<string, unknown>)[internalSort.key];
          const bv = (b as Record<string, unknown>)[internalSort.key];
          const cmp = String(av ?? '').localeCompare(String(bv ?? ''), undefined, { numeric: true });
          return internalSort.direction === 'asc' ? cmp : -cmp;
        })
      : data;

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="admin-table">
        <thead>
          <tr>
            {selectable && (
              <th className="w-10 px-4">
                <input
                  type="checkbox"
                  aria-label="Select all rows"
                  checked={!!allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = !!someSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-[var(--color-border)] cursor-pointer"
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={cn(
                  col.align === 'center' && 'text-center',
                  col.align === 'right' && 'text-right',
                  col.sortable && 'cursor-pointer select-none hover:text-[var(--color-text-primary)]'
                )}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
                aria-sort={
                  activeSortKey === col.key
                    ? activeSortDir === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : col.sortable
                    ? 'none'
                    : undefined
                }
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && <SortIcon active={activeSortKey === col.key} direction={activeSortDir} />}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <tr key={i} aria-hidden="true">
                  {selectable && <td className="px-4"><div className="skeleton w-4 h-4 rounded" /></td>}
                  {columns.map((col) => (
                    <td key={col.key}>
                      <div className="skeleton h-4 rounded" style={{ width: col.width ?? '80%' }} />
                    </td>
                  ))}
                </tr>
              ))
            : sortedData.length === 0
            ? (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    className="py-12 text-center text-sm text-[var(--color-text-tertiary)]"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )
            : sortedData.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    onRowClick && 'cursor-pointer',
                    selectedIds?.has(row.id) && 'bg-blue-50',
                    rowClassName?.(row)
                  )}
                >
                  {selectable && selectedIds && (
                    <td className="px-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        aria-label={`Select row ${row.id}`}
                        checked={selectedIds.has(row.id)}
                        onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                        className="rounded border-[var(--color-border)] cursor-pointer"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        col.align === 'center' && 'text-center',
                        col.align === 'right' && 'text-right'
                      )}
                    >
                      {col.render
                        ? col.render(row, rowIndex)
                        : String((row as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Sort indicator ───────────────────────────────────────────────────────────

function SortIcon({
  active,
  direction,
}: {
  active: boolean;
  direction: SortDirection | undefined;
}) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn('shrink-0 transition-colors', active ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)]')}
    >
      {active && direction === 'desc' ? (
        <path d="M12 4v16M12 20l-5-5M12 20l5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M12 20V4M12 4l-5 5M12 4l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}
