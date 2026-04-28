'use client';

import { useRef, useTransition } from 'react';
import { useRouter } from '@/i18n/navigation';

interface SearchBarProps {
  initialQuery: string;
  placeholder: string;
}

export function SearchBar({ initialQuery, placeholder }: SearchBarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = inputRef.current?.value.trim() ?? '';
    startTransition(() => {
      router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
    });
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="relative">
      <input
        ref={inputRef}
        type="search"
        name="q"
        defaultValue={initialQuery}
        placeholder={placeholder}
        autoFocus
        autoComplete="off"
        className="w-full h-12 pl-4 pr-14 rounded-[var(--radius-md)] border border-[var(--mz-line-strong)] bg-[var(--mz-surface)] text-[var(--mz-ink)] placeholder:text-[var(--mz-ink-mute)] text-base focus:outline-none focus:border-[var(--mz-ink)] transition-colors duration-150"
        aria-label={placeholder}
      />
      <button
        type="submit"
        disabled={isPending}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--mz-ink-mute)] hover:text-[var(--mz-accent)] hover:bg-[var(--mz-bg-deep)] transition-colors duration-150 disabled:opacity-50"
        aria-label="Search"
      >
        <SearchIcon />
      </button>
    </form>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
