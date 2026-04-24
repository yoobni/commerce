import Link from 'next/link';
import { cn } from '@/lib/cn';

interface TabItem<T extends string> {
  value: T;
  label: string;
}

interface StatusTabsProps<T extends string> {
  tabs: TabItem<T>[];
  current: T;
  buildHref: (value: T) => string;
}

export function StatusTabs<T extends string>({
  tabs,
  current,
  buildHref,
}: StatusTabsProps<T>) {
  return (
    <div
      className="flex gap-0.5 p-1 rounded-lg overflow-x-auto"
      style={{ background: 'var(--color-surface-muted)' }}
      role="tablist"
    >
      {tabs.map((tab) => {
        const active = current === tab.value;
        return (
          <Link
            key={tab.value}
            href={buildHref(tab.value)}
            role="tab"
            aria-selected={active}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
              active
                ? 'bg-white text-[var(--color-text-primary)] shadow-sm'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
