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
        'bg-[var(--mz-surface)] rounded-[var(--radius-md)] p-[14px]',
        'border border-[var(--mz-line)] flex gap-4 transition-opacity',
        isPending && 'opacity-60'
      )}
      aria-label={productName}
    >
      {/* Thumbnail — M11 spec: 76×94 portrait, radius sm */}
      <Link
        href={productPath}
        className="shrink-0 rounded-[var(--radius-sm)] overflow-hidden w-[76px] h-[94px] md:w-[88px] md:h-[110px] relative bg-[var(--mz-bg-deep)]"
        tabIndex={-1}
        aria-hidden="true"
      >
        <Image
          src={safeImageSrc(item.product_thumbnail_url)}
          alt={productName}
          fill
          sizes="(max-width: 768px) 76px, 88px"
          className="object-cover"
          loading="lazy"
          unoptimized={isFallback(safeImageSrc(item.product_thumbnail_url))}
        />
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          {/* Product name — Fraunces 15/500 */}
          <Link
            href={productPath}
            className="block font-serif text-[15px] font-medium leading-[20px] text-[var(--mz-ink)] hover:underline truncate"
          >
            {productName}
          </Link>

          {/* Color + Size meta — Inter 11/inkMute */}
          <p className="mt-[2px] flex items-center gap-1.5 text-[11px] text-[var(--mz-ink-mute)]">
            {item.color_hex && (
              <span
                className="inline-block w-2.5 h-2.5 rounded-full border border-[var(--mz-line-strong)]"
                style={{ backgroundColor: item.color_hex }}
                aria-hidden="true"
              />
            )}
            <span>{item.color}</span>
            {item.size_label && (
              <>
                <span aria-hidden="true">·</span>
                <span>{item.size_label}</span>
              </>
            )}
          </p>

          {/* Unit price — Inter 13/600 */}
          <p className="mt-1 text-[13px] font-semibold text-[var(--mz-ink)]">
            {formatPrice(unitPrice, locale)}
          </p>

          {/* Low stock warning */}
          {isLowStock && (
            <p className="mt-1 text-[11px] text-[var(--color-error)]" role="status">
              {item.stock === 0
                ? tProduct('outOfStock')
                : tProduct('lowStock', { count: item.stock })}
            </p>
          )}
        </div>

        {/* Quantity + Line total + Remove */}
        <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
          {/* Quantity stepper — borderless minimal per M11 */}
          <div
            className="flex items-center border border-[var(--mz-line-strong)] rounded-[var(--radius-sm)] overflow-hidden h-8"
            role="group"
            aria-label={t('quantity')}
          >
            <button
              type="button"
              onClick={handleDecrement}
              disabled={isPending || item.quantity <= 1}
              className="w-8 h-8 flex items-center justify-center text-[var(--mz-ink-soft)] hover:bg-[var(--mz-bg-deep)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label={t('qtyDecrease')}
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <span
              className="w-8 text-center font-mono text-[12px] text-[var(--mz-ink)]"
              aria-live="polite"
              aria-label={`${t('quantity')}: ${item.quantity}`}
            >
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              disabled={isPending || item.quantity >= item.stock}
              className="w-8 h-8 flex items-center justify-center text-[var(--mz-ink-soft)] hover:bg-[var(--mz-bg-deep)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label={t('qtyIncrease')}
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
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
            <span className="font-serif text-[15px] font-semibold text-[var(--mz-ink)]">
              {formatPrice(unitPrice * item.quantity, locale)}
            </span>
            <button
              type="button"
              onClick={handleRemove}
              disabled={isPending}
              className="text-[11px] text-[var(--mz-ink-mute)] hover:text-[var(--color-error)] transition-colors disabled:opacity-40 underline-offset-2 hover:underline"
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
