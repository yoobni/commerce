'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';
import { cn } from '@/lib/cn';
import { useTrack } from '@/hooks/useTrack';
import type { Size } from '@commerce/types';
import type { ColorOption } from '@/lib/queries/products';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActiveFilters {
  sizes: string[];
  colors: string[];
  minPrice: string;
  maxPrice: string;
}

interface FilterLabels {
  filter: string;
  size: string;
  color: string;
  price: string;
  minPrice: string;
  maxPrice: string;
  clearFilters: string;
  apply: string;
  showFilters: string;
  hideFilters: string;
  close: string;
}

interface ProductFilterProps {
  sizes: Size[];
  colors: ColorOption[];
  activeFilters: ActiveFilters;
  labels: FilterLabels;
  listName: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseList(value: string): string[] {
  return value ? value.split(',').filter(Boolean) : [];
}

function toggleItem(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((v) => v !== item) : [...list, item];
}

// ─── FilterSection ────────────────────────────────────────────────────────────

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-[var(--color-border)] py-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full text-sm font-semibold text-[var(--color-text-primary)] focus-visible:outline-none"
        aria-expanded={open}
      >
        {title}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={cn('transition-transform duration-200', open ? 'rotate-180' : '')}
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

// ─── Inner filter panel (shared between sidebar and drawer) ───────────────────

function FilterPanel({
  sizes,
  colors,
  activeFilters,
  labels,
  listName,
  onApply,
}: ProductFilterProps & { onApply?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const track = useTrack();

  const [localSizes, setLocalSizes] = useState<string[]>(activeFilters.sizes);
  const [localColors, setLocalColors] = useState<string[]>(activeFilters.colors);
  const [localMin, setLocalMin] = useState(activeFilters.minPrice);
  const [localMax, setLocalMax] = useState(activeFilters.maxPrice);

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (localSizes.length > 0) params.set('size', localSizes.join(','));
    else params.delete('size');

    if (localColors.length > 0) params.set('color', localColors.join(','));
    else params.delete('color');

    if (localMin) params.set('min_price', localMin);
    else params.delete('min_price');

    if (localMax) params.set('max_price', localMax);
    else params.delete('max_price');

    params.delete('page');

    // Track filter events
    if (localSizes.length > 0) {
      track('filter_apply', { filter_type: 'size', filter_value: localSizes.join(','), list_name: listName });
    }
    if (localColors.length > 0) {
      track('filter_apply', { filter_type: 'color', filter_value: localColors.join(','), list_name: listName });
    }
    if (localMin || localMax) {
      track('filter_apply', { filter_type: 'price', filter_value: `${localMin}-${localMax}`, list_name: listName });
    }

    router.push(`${pathname}?${params.toString()}`);
    onApply?.();
  }, [searchParams, localSizes, localColors, localMin, localMax, router, pathname, track, listName, onApply]);

  const clearAll = useCallback(() => {
    setLocalSizes([]);
    setLocalColors([]);
    setLocalMin('');
    setLocalMax('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('size');
    params.delete('color');
    params.delete('min_price');
    params.delete('max_price');
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
    onApply?.();
  }, [searchParams, router, pathname, onApply]);

  const hasFilters =
    localSizes.length > 0 || localColors.length > 0 || !!localMin || !!localMax;

  return (
    <div className="flex flex-col h-full">
      {/* Size */}
      <FilterSection title={labels.size}>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            const active = localSizes.includes(size.label);
            return (
              <button
                key={size.id}
                type="button"
                onClick={() => setLocalSizes((prev) => toggleItem(prev, size.label))}
                aria-pressed={active}
                className={cn(
                  'w-10 h-10 text-xs font-medium rounded border transition-colors duration-150',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-brand-accent)]',
                  active
                    ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)] text-white'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-secondary)]'
                )}
              >
                {size.label}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Color */}
      {colors.length > 0 && (
        <FilterSection title={labels.color}>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => {
              const active = localColors.includes(c.name);
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setLocalColors((prev) => toggleItem(prev, c.name))}
                  aria-pressed={active}
                  aria-label={c.name}
                  title={c.name}
                  className={cn(
                    'w-8 h-8 rounded-full border-2 transition-all duration-150',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-accent)]',
                    active ? 'border-[var(--color-brand-primary)] scale-110' : 'border-[var(--color-border)] hover:scale-105'
                  )}
                  style={{ backgroundColor: c.hex }}
                />
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Price */}
      <FilterSection title={labels.price}>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            placeholder={labels.minPrice}
            min={0}
            className="w-full h-9 px-3 text-sm border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)] focus:border-transparent"
          />
          <span className="text-[var(--color-text-tertiary)] text-sm shrink-0">–</span>
          <input
            type="number"
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            placeholder={labels.maxPrice}
            min={0}
            className="w-full h-9 px-3 text-sm border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)] focus:border-transparent"
          />
        </div>
      </FilterSection>

      {/* Actions */}
      <div className="pt-4 flex flex-col gap-2 mt-auto">
        <button
          type="button"
          onClick={applyFilters}
          className="h-11 w-full bg-[var(--color-cta)] text-white text-sm font-medium rounded hover:opacity-90 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-accent)]"
        >
          {labels.apply}
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="h-9 w-full text-sm text-[var(--color-text-secondary)] underline-offset-2 hover:underline focus-visible:outline-none"
          >
            {labels.clearFilters}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Desktop sidebar ──────────────────────────────────────────────────────────

export function ProductFilterSidebar(props: ProductFilterProps) {
  return (
    <aside className="w-56 shrink-0 hidden lg:block" aria-label={props.labels.filter}>
      <FilterPanel {...props} />
    </aside>
  );
}

// ─── Mobile drawer ────────────────────────────────────────────────────────────

export function ProductFilterDrawer(props: ProductFilterProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center gap-1.5 h-9 px-3 text-sm border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-neutral-50)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-accent)] transition-colors"
        aria-label={props.labels.showFilters}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
        {props.labels.showFilters}
      </button>

      {/* Drawer backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={props.labels.filter}
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-80 max-w-full bg-[var(--color-surface)] shadow-xl',
          'flex flex-col p-6',
          'transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            {props.labels.filter}
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={props.labels.close}
            className="p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-brand-accent)] rounded"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <FilterPanel {...props} onApply={() => setOpen(false)} />
        </div>
      </div>
    </>
  );
}
