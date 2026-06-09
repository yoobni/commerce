'use client';

// Client island for the PLP sort dropdown. RSC can't pass an onChange handler
// directly to <select>, so the interactive piece lives here. Pure URL mutation
// keeps it server-friendly (no client state).

interface SortOption {
  value: string;
  label: string;
}

interface SortSelectProps {
  current: string;
  options: SortOption[];
}

export function SortSelect({ current, options }: SortSelectProps) {
  return (
    <div className="relative">
      <select
        id="sort-select"
        defaultValue={current}
        onChange={(e) => {
          const url = new URL(window.location.href);
          url.searchParams.set('sort', e.target.value);
          // Sort change should land you on page 1.
          url.searchParams.delete('page');
          window.location.href = url.toString();
        }}
        className="appearance-none h-9 pl-3 pr-8 rounded-[var(--radius-md)] border border-[var(--mz-line-strong)] bg-[var(--mz-surface)] text-[12px] text-[var(--mz-ink)] focus:outline-none focus:border-[var(--mz-ink)] cursor-pointer transition-colors duration-150"
      >
        {options.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <span
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--mz-ink-mute)]"
        aria-hidden="true"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}
