'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/cn';

const PERIODS = [
  { value: '7', label: '7일' },
  { value: '30', label: '30일' },
  { value: '90', label: '90일' },
] as const;

export function PeriodSelector({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function navigate(period: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', period);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div
      className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-1"
      role="group"
      aria-label="통계 기간 선택"
    >
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => navigate(p.value)}
          aria-pressed={current === p.value}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
            current === p.value
              ? 'bg-white text-[var(--color-text-primary)] shadow-sm'
              : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
