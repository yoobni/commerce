'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

export type PeriodValue = 'today' | 'week' | 'month' | 'year';

const PERIODS: { value: PeriodValue; label: string }[] = [
  { value: 'today', label: '오늘' },
  { value: 'week', label: '이번 주' },
  { value: 'month', label: '이번 달' },
  { value: 'year', label: '올해' },
];

interface PeriodSelectorProps {
  current: PeriodValue;
}

export function PeriodSelector({ current }: PeriodSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleSelect(period: PeriodValue) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', period);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div
      className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5"
      role="tablist"
      aria-label="통계 기간 선택"
    >
      {PERIODS.map((p) => (
        <button
          key={p.value}
          role="tab"
          aria-selected={current === p.value}
          onClick={() => handleSelect(p.value)}
          className={cn(
            'px-3 py-1.5 text-xs rounded-md transition-colors cursor-pointer',
            current === p.value
              ? 'bg-white text-[var(--color-text-primary)] shadow-sm font-semibold'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
