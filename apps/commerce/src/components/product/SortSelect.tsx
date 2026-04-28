'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';

interface SortSelectProps {
  currentSort: string;
  options: { value: string; label: string }[];
  label: string;
  basePath?: string;
}

export function SortSelect({
  currentSort,
  options,
  label,
  basePath = '/products',
}: SortSelectProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value === 'newest') {
      params.delete('sort');
    } else {
      params.set('sort', e.target.value);
    }
    params.delete('page');
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  return (
    <div className="flex items-center gap-2 ml-auto">
      <label htmlFor="sort-select" className="text-[12px] text-[var(--mz-ink-mute)] shrink-0">
        {label}:
      </label>
      <div className="relative">
        <select
          id="sort-select"
          value={currentSort}
          onChange={handleChange}
          className="appearance-none h-9 pl-3 pr-8 rounded-[var(--radius-md)] border border-[var(--mz-line-strong)] bg-[var(--mz-surface)] text-[12px] text-[var(--mz-ink)] focus:outline-none focus:border-[var(--mz-ink)] cursor-pointer transition-colors duration-150"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--mz-ink-mute)]">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>
    </div>
  );
}
