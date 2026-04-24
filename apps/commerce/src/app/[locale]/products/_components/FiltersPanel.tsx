'use client';

import { useCallback, useState, useTransition } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { Category, SizeLabel } from '@commerce/types';
import type { ColorOption } from '@/lib/queries/products';
import { cn } from '@/lib/cn';

interface FiltersPanelProps {
  categories: Category[];
  sizes: SizeLabel[];
  colors: ColorOption[];
  locale: string;
}

const SIZE_LABELS: SizeLabel[] = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

export function FiltersPanel({ categories, sizes: availableSizes, colors, locale }: FiltersPanelProps) {
  const t = useTranslations('plp');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  // ── Read current filter values from URL ──
  const currentCategory = searchParams.get('category') ?? '';
  const currentSort = (searchParams.get('sort') ?? 'newest') as SortOption;
  const currentSizes = searchParams.get('sizes')?.split(',').filter(Boolean) ?? [];
  const currentColors = searchParams.get('colors')?.split(',').filter(Boolean) ?? [];
  const currentMinPrice = searchParams.get('min_price') ?? '';
  const currentMaxPrice = searchParams.get('max_price') ?? '';

  const push = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === '') {
          params.delete(k);
        } else {
          params.set(k, v);
        }
      }
      // Reset page on any filter change
      params.delete('page');
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}` as never, { scroll: false });
      });
    },
    [searchParams, pathname, router]
  );

  function toggleSize(label: string) {
    const next = currentSizes.includes(label)
      ? currentSizes.filter((s) => s !== label)
      : [...currentSizes, label];
    push({ sizes: next.join(',') || null });
  }

  function toggleColor(name: string) {
    const next = currentColors.includes(name)
      ? currentColors.filter((c) => c !== name)
      : [...currentColors, name];
    push({ colors: next.join(',') || null });
  }

  function clearAll() {
    startTransition(() => {
      router.replace(pathname as never, { scroll: false });
    });
  }

  const hasActiveFilters =
    currentCategory || currentSizes.length > 0 || currentColors.length > 0 || currentMinPrice || currentMaxPrice;

  return (
    <div className="w-full">
      {/* ── Mobile toggle ── */}
      <div className="flex items-center justify-between md:hidden mb-4">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-primary)]"
        >
          <FilterIcon />
          {open ? t('hideFilters') : t('showFilters')}
          {hasActiveFilters && (
            <span className="ml-1 h-2 w-2 rounded-full bg-[var(--color-brand-accent)]" />
          )}
        </button>
        <SortSelect
          value={currentSort}
          onChange={(v) => push({ sort: v })}
          t={t}
        />
      </div>

      {/* ── Desktop sort row ── */}
      <div className="hidden md:flex items-center justify-end mb-4">
        <SortSelect
          value={currentSort}
          onChange={(v) => push({ sort: v })}
          t={t}
        />
      </div>

      {/* ── Filter body (always visible on md+, toggle on mobile) ── */}
      <div className={cn('flex flex-col gap-6', !open && 'hidden md:flex')}>

        {/* Category */}
        {categories.length > 0 && (
          <FilterSection title={t('all')}>
            <div className="flex flex-wrap gap-2">
              <FilterChip
                active={currentCategory === ''}
                onClick={() => push({ category: null })}
              >
                {t('all')}
              </FilterChip>
              {categories.map((cat) => {
                const catName =
                  locale === 'ko' ? cat.name_ko :
                  locale === 'ja' ? cat.name_ja :
                  locale === 'de' ? cat.name_de :
                  cat.name_en;
                return (
                  <FilterChip
                    key={cat.id}
                    active={currentCategory === cat.slug}
                    onClick={() => push({ category: cat.slug })}
                  >
                    {catName}
                  </FilterChip>
                );
              })}
            </div>
          </FilterSection>
        )}

        {/* Size */}
        {availableSizes.length > 0 && (
          <FilterSection title={t('size')}>
            <div className="flex flex-wrap gap-2">
              {SIZE_LABELS.filter((l) => availableSizes.includes(l)).map((label) => (
                <FilterChip
                  key={label}
                  active={currentSizes.includes(label)}
                  onClick={() => toggleSize(label)}
                  variant="square"
                >
                  {label}
                </FilterChip>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Color */}
        {colors.length > 0 && (
          <FilterSection title={t('color')}>
            <div className="flex flex-wrap gap-2">
              {colors.map(({ name, hex }) => (
                <button
                  key={name}
                  title={name}
                  onClick={() => toggleColor(name)}
                  className={cn(
                    'h-7 w-7 rounded-full border-2 transition-transform hover:scale-110',
                    currentColors.includes(name)
                      ? 'border-[var(--color-text-primary)] scale-110'
                      : 'border-transparent'
                  )}
                  style={{ backgroundColor: hex }}
                  aria-label={name}
                  aria-pressed={currentColors.includes(name)}
                />
              ))}
            </div>
          </FilterSection>
        )}

        {/* Price range */}
        <FilterSection title={t('price')}>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              placeholder={t('minPrice')}
              defaultValue={currentMinPrice}
              className="w-full rounded border border-[var(--color-border)] px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-accent)]"
              onBlur={(e) => push({ min_price: e.currentTarget.value || null })}
            />
            <span className="text-[var(--color-text-tertiary)]">–</span>
            <input
              type="number"
              min={0}
              placeholder={t('maxPrice')}
              defaultValue={currentMaxPrice}
              className="w-full rounded border border-[var(--color-border)] px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-accent)]"
              onBlur={(e) => push({ max_price: e.currentTarget.value || null })}
            />
          </div>
        </FilterSection>

        {/* Clear */}
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-sm text-[var(--color-text-secondary)] underline underline-offset-2 hover:text-[var(--color-text-primary)] text-left"
          >
            {t('clearFilters')}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Helper sub-components ──────────────────────────────────────────────────────

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'popular';

function SortSelect({
  value,
  onChange,
  t,
}: {
  value: SortOption;
  onChange: (v: string) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-accent)]"
      aria-label={t('sort' as never) ?? 'Sort'}
    >
      <option value="newest">{t('sortNewest')}</option>
      <option value="price_asc">{t('sortPriceAsc')}</option>
      <option value="price_desc">{t('sortPriceDesc')}</option>
      <option value="popular">{t('sortPopular')}</option>
    </select>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
        {title}
      </p>
      {children}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
  variant = 'pill',
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'pill' | 'square';
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'border text-sm font-medium transition-colors',
        variant === 'square'
          ? 'h-8 min-w-[2rem] px-2 rounded'
          : 'rounded-full px-3 py-1',
        active
          ? 'border-[var(--color-text-primary)] bg-[var(--color-text-primary)] text-white'
          : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-primary)]'
      )}
    >
      {children}
    </button>
  );
}

function FilterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <line x1="2" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="4" y1="8" x2="12" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="6" y1="12" x2="10" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
