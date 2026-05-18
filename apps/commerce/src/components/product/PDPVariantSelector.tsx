'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { SizeGuideModal } from './SizeGuideModal';
import type { ProductOption, Size } from '@commerce/types';

interface PDPVariantSelectorProps {
  options: ProductOption[];
  productId: string;
  onSelectionChange: (option: ProductOption | null) => void;
  /** Hound profile recommended size (e.g. 'L') — adds ★ marker on matching cell */
  fitSize?: string | null;
}

interface ColorGroup {
  name: string;
  hex: string | null;
  options: ProductOption[];
}

export function PDPVariantSelector({
  options,
  productId,
  onSelectionChange,
  fitSize = null,
}: PDPVariantSelectorProps) {
  const t = useTranslations('product');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Deduplicate colors
  const colors = useMemo<ColorGroup[]>(() => {
    const map = new Map<string, ColorGroup>();
    for (const opt of options) {
      if (!map.has(opt.color)) {
        map.set(opt.color, { name: opt.color, hex: opt.color_hex, options: [] });
      }
      map.get(opt.color)!.options.push(opt);
    }
    return Array.from(map.values());
  }, [options]);

  // Sizes available for the selected color
  const availableSizes = useMemo<Size[]>(() => {
    if (!selectedColor) return [];
    const colorOptions = options.filter((o) => o.color === selectedColor && o.size);
    const seen = new Set<string>();
    return colorOptions
      .filter((o) => {
        if (!o.size || seen.has(o.size.id)) return false;
        seen.add(o.size.id);
        return true;
      })
      .map((o) => o.size!)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [options, selectedColor]);

  // All unique sizes for size guide modal
  const allSizes = useMemo<Size[]>(() => {
    const seen = new Set<string>();
    return options
      .filter((o) => o.size && !seen.has(o.size.id) && !seen.add(o.size.id))
      .map((o) => o.size!)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [options]);

  function isOptionAvailable(color: string, sizeId: string): boolean {
    return options.some((o) => o.color === color && o.size?.id === sizeId && o.stock > 0);
  }

  function getOption(color: string, sizeId: string): ProductOption | undefined {
    return options.find((o) => o.color === color && o.size?.id === sizeId);
  }

  function handleColorSelect(color: string) {
    setSelectedColor(color);
    setSelectedSize(null);
    onSelectionChange(null);
  }

  function handleSizeSelect(sizeId: string) {
    if (!selectedColor) return;
    const option = getOption(selectedColor, sizeId);
    setSelectedSize(sizeId);
    onSelectionChange(option ?? null);
  }

  return (
    <div className="space-y-5">
      {/* Color selector — M8 spec: 34×34 swatch, 2px ink ring + 3px inset on active */}
      <div className="space-y-2.5">
        <p className="text-[13px] font-semibold text-[var(--mz-ink)]">
          {t('color')}
          {selectedColor && (
            <span className="ml-1 font-normal text-[var(--mz-ink-mute)]">· {selectedColor}</span>
          )}
        </p>
        <div className="flex flex-wrap gap-[10px]" role="radiogroup" aria-label={t('selectColor')}>
          {colors.map(({ name, hex }) => {
            const isActive = selectedColor === name;
            return (
              <button
                key={name}
                type="button"
                role="radio"
                aria-checked={isActive}
                aria-label={name}
                onClick={() => handleColorSelect(name)}
                className={cn(
                  'relative box-border h-[34px] w-[34px] rounded-full transition-all duration-150',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mz-ink)]',
                  isActive
                    ? 'border-2 border-[var(--mz-ink)] p-[3px]'
                    : 'border border-[var(--mz-line-strong)] p-0 hover:border-[var(--mz-ink)]'
                )}
              >
                <span
                  className="block h-full w-full rounded-full"
                  style={{ background: hex ?? '#cccccc' }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Size selector — 4-cell grid per dir-b spec */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[13px] font-semibold text-[var(--mz-ink)]">{t('size')}</span>
          <button
            type="button"
            onClick={() => setSizeGuideOpen(true)}
            className="text-[12px] font-medium text-[var(--mz-ink-mute)] hover:text-[var(--mz-ink)] transition-colors"
          >
            {t('sizeGuide')} →
          </button>
        </div>

        {!selectedColor ? (
          <p className="text-sm text-[var(--mz-ink-mute)]">{t('selectColor')}</p>
        ) : (
          <div
            className="grid grid-cols-4 gap-2"
            role="radiogroup"
            aria-label={t('selectSize')}
          >
            {availableSizes.map((size) => {
              const option = getOption(selectedColor, size.id);
              const stock = option?.stock ?? 0;
              const available = stock > 0;
              const isSelected = selectedSize === size.id;
              const isFitMatch = !!fitSize && size.label === fitSize;
              const stockText = !available
                ? 'sold'
                : stock <= 5
                  ? `${stock} left`
                  : `${stock}`;
              return (
                <button
                  key={size.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`${size.label}${!available ? ' — out of stock' : ''}`}
                  disabled={!available}
                  onClick={() => handleSizeSelect(size.id)}
                  className={cn(
                    'py-[11px] text-center rounded-[var(--radius-md)] transition-all duration-150',
                    'border-[1.5px]',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mz-accent)]',
                    isSelected
                      ? 'bg-[var(--mz-ink)] text-[var(--mz-bg)] border-[var(--mz-ink)]'
                      : 'bg-[var(--mz-surface)] text-[var(--mz-ink)] border-[var(--mz-line)] hover:border-[var(--mz-line-strong)]',
                    !available && 'opacity-35 cursor-not-allowed'
                  )}
                >
                  <div className="font-serif text-[15px] font-[500] leading-none">
                    {size.label}
                    {isFitMatch && (
                      <span
                        className={cn(
                          'ml-[3px]',
                          isSelected ? 'text-[var(--mz-bg)]' : 'text-[var(--mz-accent)]'
                        )}
                        aria-label="recommended fit"
                      >
                        ★
                      </span>
                    )}
                  </div>
                  <div className="text-[9px] mt-[2px] opacity-75 leading-none">{stockText}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Size guide modal */}
      <SizeGuideModal
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        sizes={allSizes}
        productId={productId}
      />
    </div>
  );
}
