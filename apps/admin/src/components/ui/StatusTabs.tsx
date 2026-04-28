/**
 * StatusTabs — link-based filter tab bar.
 *
 * Design guide:
 *   <StatusTabs
 *     tabs={[
 *       { value: 'ALL', label: '전체' },
 *       { value: 'ACTIVE', label: '활성', count: 42 },
 *     ]}
 *     activeValue={status}
 *     buildUrl={(v) => `/orders?status=${v}&page=1`}
 *   />
 */

import Link from 'next/link';
import { cn } from '@/lib/cn';

export interface TabItem {
  value: string;
  label: string;
  count?: number;
}

interface StatusTabsProps {
  tabs: TabItem[];
  activeValue: string;
  buildUrl: (value: string) => string;
  className?: string;
}

export function StatusTabs({ tabs, activeValue, buildUrl, className }: StatusTabsProps) {
  return (
    <div
      className={cn(
        'flex gap-1 p-1 bg-gray-100 rounded-lg overflow-x-auto scrollbar-none',
        className
      )}
      role="tablist"
      aria-label="상태 필터"
    >
      {tabs.map((tab) => {
        const isActive = activeValue === tab.value;
        return (
          <Link
            key={tab.value}
            href={buildUrl(tab.value)}
            role="tab"
            aria-selected={isActive}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap shrink-0',
              isActive
                ? 'bg-white text-[var(--color-text-primary)] shadow-sm'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-px rounded text-xs font-medium',
                  isActive
                    ? 'bg-[var(--color-border)] text-[var(--color-text-secondary)]'
                    : 'bg-white/60 text-[var(--color-text-tertiary)]'
                )}
              >
                {tab.count.toLocaleString()}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
