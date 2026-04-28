'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';

interface PriceRangeFilterProps {
  currentMin?: number;
  currentMax?: number;
  minLabel: string;
  maxLabel: string;
  applyLabel: string;
  basePath?: string;
}

export function PriceRangeFilter({
  currentMin,
  currentMax,
  minLabel,
  maxLabel,
  applyLabel,
  basePath = '/products',
}: PriceRangeFilterProps) {
  const [min, setMin] = useState(currentMin?.toString() ?? '');
  const [max, setMax] = useState(currentMax?.toString() ?? '');
  const searchParams = useSearchParams();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (min.trim()) params.set('min_price', min.trim());
    else params.delete('min_price');
    if (max.trim()) params.set('max_price', max.trim());
    else params.delete('max_price');
    params.delete('page');
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          value={min}
          onChange={(e) => setMin(e.target.value)}
          placeholder={minLabel}
          min={0}
          className="w-0 flex-1 h-8 px-2 rounded-[var(--radius-md)] border border-[var(--mz-line-strong)] bg-[var(--mz-surface)] text-[11px] text-[var(--mz-ink)] placeholder:text-[var(--mz-ink-mute)] focus:outline-none focus:border-[var(--mz-ink)] transition-colors duration-150"
        />
        <span className="text-[10px] text-[var(--mz-ink-mute)] shrink-0">–</span>
        <input
          type="number"
          value={max}
          onChange={(e) => setMax(e.target.value)}
          placeholder={maxLabel}
          min={0}
          className="w-0 flex-1 h-8 px-2 rounded-[var(--radius-md)] border border-[var(--mz-line-strong)] bg-[var(--mz-surface)] text-[11px] text-[var(--mz-ink)] placeholder:text-[var(--mz-ink-mute)] focus:outline-none focus:border-[var(--mz-ink)] transition-colors duration-150"
        />
      </div>
      <button
        type="submit"
        className="w-full h-8 rounded-[var(--radius-md)] border border-[var(--mz-line-strong)] text-[11px] font-medium text-[var(--mz-ink)] hover:bg-[var(--mz-bg-deep)] transition-colors duration-150"
      >
        {applyLabel}
      </button>
    </form>
  );
}
