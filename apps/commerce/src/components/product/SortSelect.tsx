'use client';

import { useRouter } from '@/i18n/navigation';

interface SortSelectProps {
  defaultValue: string;
  sortUrls: Record<string, string>;
  options: { value: string; label: string }[];
}

export function SortSelect({ defaultValue, sortUrls, options }: SortSelectProps) {
  const router = useRouter();

  return (
    <div className="relative">
      <select
        id="sort-select"
        defaultValue={defaultValue}
        className="appearance-none h-9 pl-3 pr-8 rounded-[var(--radius-md)] border border-[var(--mz-line-strong)] bg-[var(--mz-surface)] text-[12px] text-[var(--mz-ink)] focus:outline-none focus:border-[var(--mz-ink)] cursor-pointer transition-colors duration-150"
        onChange={(e) => {
          const url = sortUrls[e.target.value];
          if (url !== undefined) router.push(url);
        }}
      >
        {options.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
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
  );
}
