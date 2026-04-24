import Link from 'next/link';

interface HiddenField {
  name: string;
  value: string;
}

interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
  hiddenFields?: HiddenField[];
  resetHref?: string;
  extraControls?: React.ReactNode;
}

export function SearchBar({
  defaultValue = '',
  placeholder = '검색',
  hiddenFields = [],
  resetHref,
  extraControls,
}: SearchBarProps) {
  return (
    <form method="GET" className="flex items-center gap-2 ml-auto">
      {hiddenFields.map((f) => (
        <input key={f.name} type="hidden" name={f.name} value={f.value} />
      ))}
      {extraControls}
      <input
        type="text"
        name="search"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-lg w-52 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] bg-white"
      />
      <button
        type="submit"
        className="px-4 py-1.5 text-sm bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
      >
        검색
      </button>
      {resetHref && defaultValue && (
        <Link
          href={resetHref}
          className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] transition-colors"
        >
          초기화
        </Link>
      )}
    </form>
  );
}
