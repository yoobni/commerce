'use client';

import { useRouter, usePathname } from '@/i18n/navigation';
import { useTransition, useRef } from 'react';

interface SearchInputProps {
  defaultValue?: string;
  placeholder?: string;
}

export function SearchInput({ defaultValue = '', placeholder }: SearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = inputRef.current?.value.trim() ?? '';
    startTransition(() => {
      if (q) {
        router.replace(`${pathname}?q=${encodeURIComponent(q)}` as never);
      } else {
        router.replace(pathname as never);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="flex gap-2">
      <input
        ref={inputRef}
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete="off"
        className="flex-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)]"
      />
      <button
        type="submit"
        className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded bg-[var(--color-cta)] text-white transition-opacity hover:opacity-90 active:opacity-80"
        aria-label="search"
      >
        <SearchIcon />
      </button>
    </form>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
