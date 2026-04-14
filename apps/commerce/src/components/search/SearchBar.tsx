'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTrack } from '@/hooks/useTrack';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Suggestion {
  product_id: string;
  name: string;
  slug: string;
  thumbnail_url: string;
}

interface SearchBarProps {
  locale: string;
  placeholder: string;
  /** Aria label for the search input */
  label: string;
  /** Called when the overlay closes (mobile only) */
  onClose?: () => void;
}

// ─── Debounce ─────────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SearchBar({ locale, placeholder, label, onClose }: SearchBarProps) {
  const router = useRouter();
  const track = useTrack();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const debouncedValue = useDebounce(value, 250);

  // ── Fetch suggestions ──────────────────────────────────────────────────────

  useEffect(() => {
    if (debouncedValue.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(`/api/search/suggestions?q=${encodeURIComponent(debouncedValue.trim())}&locale=${locale}`)
      .then((r) => r.json())
      .then((data: Suggestion[]) => {
        if (!cancelled) {
          setSuggestions(data);
          setOpen(data.length > 0);
          setActiveIdx(-1);
        }
      })
      .catch(() => { /* silent */ })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [debouncedValue, locale]);

  // ── Close on outside click ─────────────────────────────────────────────────

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // ── Submit ─────────────────────────────────────────────────────────────────

  const submit = useCallback(
    (query: string) => {
      const q = query.trim();
      if (!q) return;
      setOpen(false);
      track('search_submit', { search_query: q, search_type: 'keyword' });
      router.push(`/${locale}/search?q=${encodeURIComponent(q)}`);
      onClose?.();
    },
    [router, locale, track, onClose]
  );

  // ── Keyboard navigation ────────────────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!open) {
        if (e.key === 'Enter') submit(value);
        if (e.key === 'Escape') { setValue(''); onClose?.(); }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIdx >= 0 && suggestions[activeIdx]) {
          const s = suggestions[activeIdx];
          track('search_result_click', { search_query: value, product_id: s.product_id, position: activeIdx + 1 });
          router.push(`/${locale}/products/${s.slug}`);
          setOpen(false);
          onClose?.();
        } else {
          submit(value);
        }
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    },
    [open, value, suggestions, activeIdx, submit, router, locale, track, onClose]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: Suggestion, index: number) => {
      track('search_result_click', { search_query: value, product_id: suggestion.product_id, position: index + 1 });
      router.push(`/${locale}/products/${suggestion.slug}`);
      setOpen(false);
      onClose?.();
    },
    [router, locale, value, track, onClose]
  );

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input */}
      <div className="relative flex items-center">
        <span className="absolute left-3 text-[var(--color-text-tertiary)] pointer-events-none" aria-hidden="true">
          {loading ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          )}
        </span>
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-label={label}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-activedescendant={activeIdx >= 0 ? `suggestion-${activeIdx}` : undefined}
          autoComplete="off"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-10 pl-9 pr-9 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)] focus:border-transparent transition-shadow"
        />
        {value && (
          <button
            type="button"
            aria-label="Clear"
            onClick={() => { setValue(''); setSuggestions([]); setOpen(false); inputRef.current?.focus(); }}
            className="absolute right-3 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute top-full left-0 right-0 mt-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg overflow-hidden z-50"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.product_id}
              id={`suggestion-${i}`}
              role="option"
              aria-selected={i === activeIdx}
              className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer text-sm transition-colors ${
                i === activeIdx
                  ? 'bg-[var(--color-neutral-50)]'
                  : 'hover:bg-[var(--color-neutral-50)]'
              }`}
              onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(s, i); }}
            >
              <div className="relative w-8 h-8 rounded overflow-hidden bg-[var(--color-neutral-100)] shrink-0">
                <Image
                  src={s.thumbnail_url}
                  alt={s.name}
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
              <span className="text-[var(--color-text-primary)] truncate">{s.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
