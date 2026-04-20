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
    const colorOptions = options.filter(
      (o) => o.color === selectedColor && o.size
    );
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
    return options.some(
      (o) => o.color === color && o.size?.id === sizeId && o.stock > 0
    );
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
      {/* Color selector */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            {t('color')}
          </span>
          {selectedColor && (
            <span className="text-sm text-[var(--color-text-secondary)]">
              — {selectedColor}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('selectColor')}>
          {colors.map(({ name, hex }) => (
            <button
              key={name}
              type="button"
              role="radio"
              aria-checked={selectedColor === name}
              aria-label={name}
              onClick={() => handleColorSelect(name)}
              className={cn(
                'w-8 h-8 rounded-full border-2 transition-all duration-150 flex-shrink-0',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-accent)]',
                selectedColor === name
                  ? 'border-[var(--color-brand-primary)] scale-110 shadow-md'
                  : 'border-transparent hover:border-[var(--color-neutral-300)] hover:scale-105'
              )}
              style={{ backgroundColor: hex ?? '#cccccc' }}
            />
          ))}
        </div>
      </div>

      {/* Size selector */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            {t('size')}
          </span>
          <button
            type="button"
            onClick={() => setSizeGuideOpen(true)}
            className="text-xs text-[var(--color-brand-secondary)] underline underline-offset-2 hover:text-[var(--color-brand-primary)] transition-colors"
          >
            {t('sizeGuide')}
          </button>
        </div>

        {!selectedColor ? (
          <p className="text-sm text-[var(--color-text-tertiary)]">
            {t('selectColor')}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('selectSize')}>
            {availableSizes.map((size) => {
              const available = isOptionAvailable(selectedColor, size.id);
              const isSelected = selectedSize === size.id;
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
                    'relative min-w-[52px] h-10 px-3 rounded text-sm font-medium',
                    'border transition-all duration-150',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-accent)]',
                    isSelected
                      ? 'bg-[var(--color-brand-primary)] text-white border-[var(--color-brand-primary)]'
                      : available
                      ? 'bg-white text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)]'
                      : 'bg-[var(--color-neutral-50)] text-[var(--color-text-tertiary)] border-[var(--color-border)] cursor-not-allowed'
                  )}
                >
                  {/* Strikethrough for out of stock */}
                  {!available && (
                    <span
                      className="absolute inset-0 flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <span className="absolute w-full h-px bg-[var(--color-text-tertiary)] rotate-[-45deg]" />
                    </span>
                  )}
                  {size.label}
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
