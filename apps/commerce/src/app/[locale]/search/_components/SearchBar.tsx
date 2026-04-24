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
        className="w-full h-12 pl-4 pr-14 rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] text-base focus:outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 transition"
        aria-label={placeholder}
      />
      <button
        type="submit"
        disabled={isPending}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-md flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-neutral-100)] transition-colors disabled:opacity-50"
        aria-label="Search"
      >
        <SearchIcon />
      </button>
    </form>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
