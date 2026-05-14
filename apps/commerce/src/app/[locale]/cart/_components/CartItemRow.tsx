'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { cn } from '@/lib/cn';
import { formatPrice } from '@/lib/format';
import type { Locale } from '@/i18n/routing';
import type { CartItemDisplay } from '@/lib/cart/queries';
import { safeImageSrc, isFallback } from '@/lib/images/safeSrc';

type PriceKey =
  | 'additional_price_krw'
  | 'additional_price_usd'
  | 'additional_price_jpy'
  | 'additional_price_eur';
type BasePriceKey =
  | 'product_base_price_krw'
  | 'product_base_price_usd'
  | 'product_base_price_jpy'
  | 'product_base_price_eur';
type NameKey = 'product_name_ko' | 'product_name_en' | 'product_name_ja' | 'product_name_de';

const LOCALE_MAP: Record<Locale, { base: BasePriceKey; additional: PriceKey; name: NameKey }> = {
  ko: {
    base: 'product_base_price_krw',
    additional: 'additional_price_krw',
    name: 'product_name_ko',
  },
  en: {
    base: 'product_base_price_usd',
    additional: 'additional_price_usd',
    name: 'product_name_en',
  },
  ja: {
    base: 'product_base_price_jpy',
    additional: 'additional_price_jpy',
    name: 'product_name_ja',
  },
  de: {
    base: 'product_base_price_eur',
    additional: 'additional_price_eur',
    name: 'product_name_de',
  },
};

interface CartItemRowProps {
  item: CartItemDisplay;
  locale: Locale;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export function CartItemRow({ item, locale, onQuantityChange, onRemove }: CartItemRowProps) {
  const t = useTranslations('cart');
  const tProduct = useTranslations('product');
  const [isPending, startTransition] = useTransition();

  const map = LOCALE_MAP[locale];
  const unitPrice = item[map.base] + item[map.additional];
  const productName = item[map.name];

  function handleDecrement() {
    if (item.quantity <= 1) return;
    startTransition(() => onQuantityChange(item.id, item.quantity - 1));
  }

  function handleIncrement() {
    if (item.quantity >= item.stock) return;
    startTransition(() => onQuantityChange(item.id, item.quantity + 1));
  }

  function handleRemove() {
    startTransition(() => onRemove(item.id));
  }

  const isLowStock = item.stock > 0 && item.stock <= item.low_stock_threshold;
  const productPath = `/${locale}/products/${item.product_slug}`;

  return (
    <article
      className={cn(
        'bg-white rounded-xl p-4 flex gap-4 shadow-sm transition-opacity',
        isPending && 'opacity-60'
      )}
      aria-label={productName}
    >
      {/* Thumbnail */}
      <Link
        href={productPath}
        className="shrink-0 rounded-lg overflow-hidden w-24 h-24 md:w-28 md:h-28 relative bg-[var(--color-neutral-100)]"
        tabIndex={-1}
        aria-hidden="true"
      >
        <Image
          src={safeImageSrc(item.product_thumbnail_url)}
          alt={productName}
          fill
          sizes="(max-width: 768px) 96px, 112px"
          className="object-cover"
          loading="lazy"
          unoptimized={isFallback(safeImageSrc(item.product_thumbnail_url))}
        />
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
        <div className="space-y-0.5">
          {/* Color + Size badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {item.color_hex && (
              <span
                className="inline-block w-3 h-3 rounded-full border border-[var(--color-neutral-200)]"
                style={{ backgroundColor: item.color_hex }}
                aria-label={item.color}
              />
            )}
            <span className="text-xs text-[var(--color-text-secondary)]">{item.color}</span>
            {item.size_label && (
              <>
                <span className="text-[var(--color-neutral-300)] text-xs">·</span>
                <span className="text-xs text-[var(--color-text-secondary)]">
                  {item.size_label}
                </span>
              </>
            )}
          </div>

          {/* Product name */}
          <Link
            href={productPath}
            className="block text-sm font-medium text-[var(--color-text-primary)] hover:underline truncate"
          >
            {productName}
          </Link>

          {/* Unit price */}
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            {formatPrice(unitPrice, locale)}
          </p>

          {/* Low stock warning */}
          {isLowStock && (
            <p className="text-xs text-[var(--color-error)]" role="status">
              {item.stock === 0
                ? tProduct('outOfStock')
                : tProduct('lowStock', { count: item.stock })}
            </p>
          )}
        </div>

        {/* Quantity + Remove row */}
        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
          {/* Quantity stepper */}
          <div
            className="flex items-center border border-[var(--color-neutral-200)] rounded-lg overflow-hidden"
            role="group"
            aria-label={t('quantity')}
          >
            <button
              type="button"
              onClick={handleDecrement}
              disabled={isPending || item.quantity <= 1}
              className="w-9 h-9 flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-neutral-50)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label={t('qtyDecrease')}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <span
              className="w-10 text-center text-sm font-medium text-[var(--color-text-primary)]"
              aria-live="polite"
              aria-label={`${t('quantity')}: ${item.quantity}`}
            >
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              disabled={isPending || item.quantity >= item.stock}
              className="w-9 h-9 flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-neutral-50)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label={t('qtyIncrease')}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M7 2v10M2 7h10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Line total + Remove */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">
              {formatPrice(unitPrice * item.quantity, locale)}
            </span>
            <button
              type="button"
              onClick={handleRemove}
              disabled={isPending}
              className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-error)] transition-colors disabled:opacity-40"
              aria-label={`${productName} ${t('remove')}`}
            >
              {t('remove')}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
