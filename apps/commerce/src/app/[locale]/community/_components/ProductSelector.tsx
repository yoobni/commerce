'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { searchProductsForPost } from '@/lib/api/community/client';
import { safeImageSrc, isFallback } from '@/lib/images/safeSrc';
import { getProductName, formatPrice } from '@/lib/format';
import type { Product, Locale } from '@commerce/types';

interface ProductSelectorProps {
  value: Product[];
  onChange: (next: Product[]) => void;
  locale: Locale;
  max?: number;
  disabled?: boolean;
}

const DEFAULT_MAX = 5;
const DEBOUNCE_MS = 250;

export function ProductSelector({
  value,
  onChange,
  locale,
  max = DEFAULT_MAX,
  disabled = false,
}: ProductSelectorProps) {
  const t = useTranslations('community');
  const tCommon = useTranslations('common');
  const searchId = useId();
  const resultsId = useId();
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const atMax = value.length >= max;

  // Debounced typeahead search via server action.
  useEffect(() => {
    if (disabled || atMax) return;
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    const handle = setTimeout(async () => {
      const selectedIds = value.map((p) => p.id);
      try {
        const res = await searchProductsForPost(q, selectedIds);
        setResults(res);
      } catch {
        setResults([]);
      }
      setIsSearching(false);
      setOpen(true);
    }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [query, value, disabled, atMax]);

  // Close dropdown on outside click.
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  function add(product: Product) {
    if (value.some((p) => p.id === product.id)) return;
    if (value.length >= max) return;
    onChange([...value, product]);
    setQuery('');
    setResults([]);
    setOpen(false);
  }

  function remove(productId: string) {
    onChange(value.filter((p) => p.id !== productId));
  }

  return (
    <div className="flex flex-col gap-3" ref={wrapRef}>
      {/* Selected chips */}
      {value.length > 0 && (
        <ul
          aria-label={t('selectedProducts')}
          className="flex flex-wrap gap-2 list-none p-0 m-0"
        >
          {value.map((p) => {
            const name = getProductName(p, locale);
            const thumb = safeImageSrc(p.thumbnail_url);
            return (
              <li
                key={p.id}
                className="inline-flex items-center gap-2 pl-1 pr-2 py-1 rounded-[var(--radius-pill)] bg-[var(--mz-bg-deep)] border border-[var(--mz-line)] max-w-full"
              >
                <Image
                  src={thumb}
                  alt=""
                  width={20}
                  height={20}
                  aria-hidden="true"
                  className="w-5 h-5 rounded-full object-cover shrink-0"
                  unoptimized={isFallback(thumb)}
                />
                <span className="text-[12px] text-[var(--mz-ink)] truncate max-w-[140px]">
                  {name}
                </span>
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  disabled={disabled}
                  aria-label={t('removeProductAria', { name })}
                  className="w-4 h-4 inline-flex items-center justify-center text-[var(--mz-ink-mute)] hover:text-[var(--mz-ink)] transition-colors disabled:opacity-40"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Search input + dropdown */}
      <div className="relative">
        <label htmlFor={searchId} className="sr-only">
          {t('searchProductsLabel')}
        </label>
        <input
          id={searchId}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={
            atMax
              ? t('maxProductsReached', { max })
              : t('searchProductsPlaceholder')
          }
          disabled={disabled || atMax}
          maxLength={100}
          role="combobox"
          aria-expanded={open}
          aria-controls={resultsId}
          aria-autocomplete="list"
          className="w-full h-12 px-4 rounded-[var(--radius-md)] bg-[var(--mz-surface)] text-[var(--mz-ink)] text-[14px] border border-[var(--mz-line)] placeholder:text-[var(--mz-ink-mute)] focus:border-[var(--mz-ink)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        />

        {open && (
          <ul
            id={resultsId}
            role="listbox"
            aria-label={t('searchProductsLabel')}
            className="absolute z-20 left-0 right-0 top-[calc(100%+4px)] max-h-72 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--mz-line)] bg-[var(--mz-surface)] shadow-[0_4px_18px_rgba(0,0,0,0.08)] py-1 list-none m-0 p-0"
          >
            {isSearching ? (
              <li className="px-4 py-3 text-[12px] text-[var(--mz-ink-mute)]" aria-live="polite">
                {tCommon('loading')}
              </li>
            ) : results.length === 0 ? (
              <li className="px-4 py-3 text-[12px] text-[var(--mz-ink-mute)]" aria-live="polite">
                {t('noProductMatches')}
              </li>
            ) : (
              results.map((p) => {
                const name = getProductName(p, locale);
                const thumb = safeImageSrc(p.thumbnail_url);
                const price = formatPrice(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (p as any).base_price_krw ?? 0,
                  locale
                );
                return (
                  <li key={p.id} role="option" aria-selected={false}>
                    <button
                      type="button"
                      onClick={() => add(p)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[var(--mz-bg-deep)] transition-colors"
                    >
                      <Image
                        src={thumb}
                        alt=""
                        width={36}
                        height={36}
                        aria-hidden="true"
                        className="w-9 h-9 rounded-[var(--radius-sm)] object-cover shrink-0 bg-[var(--mz-bg-deep)]"
                        unoptimized={isFallback(thumb)}
                      />
                      <span className="flex-1 min-w-0">
                        <span className="block text-[13px] font-medium text-[var(--mz-ink)] truncate">
                          {name}
                        </span>
                        <span className="block text-[11px] text-[var(--mz-ink-mute)]">{price}</span>
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>

      {/* Helper text + counter */}
      <p className="text-[11px] text-[var(--mz-ink-mute)] flex items-center justify-between gap-2">
        <span>{t('productSelectorHint')}</span>
        <span className="tabular-nums">
          {value.length} / {max}
        </span>
      </p>
    </div>
  );
}
