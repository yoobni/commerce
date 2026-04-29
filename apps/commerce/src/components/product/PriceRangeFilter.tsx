'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';

interface PriceRangeFilterProps {
  baseUrl: string;
  currentMin?: number;
  currentMax?: number;
  labelMin: string;
  labelMax: string;
  labelApply: string;
}

export function PriceRangeFilter({
  baseUrl,
  currentMin,
  currentMax,
  labelMin,
  labelMax,
  labelApply,
}: PriceRangeFilterProps) {
  const router = useRouter();
  const [min, setMin] = useState(currentMin?.toString() ?? '');
  const [max, setMax] = useState(currentMax?.toString() ?? '');

  function handleApply(e: React.FormEvent) {
    e.preventDefault();
    const [path, qs] = baseUrl.split('?') as [string, string | undefined];
    const params = new URLSearchParams(qs ?? '');
    if (min.trim()) params.set('min_price', min.trim());
    else params.delete('min_price');
    if (max.trim()) params.set('max_price', max.trim());
    else params.delete('max_price');
    params.delete('page');
    const newQs = params.toString();
    router.push(newQs ? `${path}?${newQs}` : path);
  }

  const inputClass =
    'w-full h-8 px-2 rounded-[var(--radius-sm)] border border-[var(--mz-line-strong)] bg-[var(--mz-surface)] text-[12px] text-[var(--mz-ink)] focus:outline-none focus:border-[var(--mz-ink)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

  return (
    <form onSubmit={handleApply} className="space-y-2">
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min={0}
          step={1000}
          value={min}
          onChange={(e) => setMin(e.target.value)}
          placeholder={labelMin}
          className={inputClass}
          aria-label={labelMin}
        />
        <span className="text-[11px] text-[var(--mz-ink-mute)] shrink-0">~</span>
        <input
          type="number"
          min={0}
          step={1000}
          value={max}
          onChange={(e) => setMax(e.target.value)}
          placeholder={labelMax}
          className={inputClass}
          aria-label={labelMax}
        />
      </div>
      <button
        type="submit"
        className="w-full h-8 rounded-[var(--radius-md)] border border-[var(--mz-line-strong)] bg-[var(--mz-surface)] text-[12px] font-medium text-[var(--mz-ink)] hover:bg-[var(--mz-bg-deep)] transition-colors"
      >
        {labelApply}
      </button>
    </form>
  );
}
