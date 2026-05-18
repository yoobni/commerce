'use client';

import { useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/format';
import type { Locale } from '@/i18n/routing';

/** Shipping thresholds and fees per locale */
const SHIPPING: Record<Locale, { freeThreshold: number; fee: number }> = {
  ko: { freeThreshold: 50000, fee: 3000 },
  en: { freeThreshold: 50, fee: 5 },
  ja: { freeThreshold: 5000, fee: 500 },
  de: { freeThreshold: 50, fee: 5 },
};

interface CartSummaryProps {
  subtotal: number;
  locale: Locale;
  itemCount: number;
  onCheckout: () => void;
  isCheckingOut?: boolean;
}

export function CartSummary({
  subtotal,
  locale,
  itemCount,
  onCheckout,
  isCheckingOut = false,
}: CartSummaryProps) {
  const t = useTranslations('cart');
  const [isPending, startTransition] = useTransition();

  const { freeThreshold, fee } = SHIPPING[locale];
  const shippingFee = subtotal >= freeThreshold ? 0 : fee;
  const total = subtotal + shippingFee;
  const isFreeShipping = shippingFee === 0;
  const loading = isPending || isCheckingOut;

  function handleCheckout() {
    startTransition(() => onCheckout());
  }

  return (
    <aside
      className="bg-[var(--mz-surface)] rounded-[var(--radius-md)] border border-[var(--mz-line)] p-5 h-fit lg:sticky lg:top-6"
      aria-label={t('summaryAriaLabel')}
    >
      <h2 className="font-serif text-[18px] font-medium leading-[1.2] text-[var(--mz-ink)] mb-4">
        {t('title')}{' '}
        <span className="font-sans text-[12px] font-normal text-[var(--mz-ink-mute)]">
          ({itemCount})
        </span>
      </h2>

      <dl className="space-y-[10px] text-[12.5px]">
        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <dt className="text-[var(--mz-ink-mute)]">{t('subtotal')}</dt>
          <dd className="text-[var(--mz-ink)]">{formatPrice(subtotal, locale)}</dd>
        </div>

        {/* Shipping */}
        <div className="flex items-center justify-between">
          <dt className="text-[var(--mz-ink-mute)]">{t('shipping')}</dt>
          <dd
            className={
              isFreeShipping ? 'uppercase tracking-[0.08em] text-[var(--mz-ink)]' : 'text-[var(--mz-ink)]'
            }
          >
            {isFreeShipping ? t('freeShipping') : formatPrice(shippingFee, locale)}
          </dd>
        </div>

        {/* Free shipping progress (only if not yet free) */}
        {!isFreeShipping && (
          <p className="text-[11px] text-[var(--mz-ink-mute)] bg-[var(--mz-bg-deep)] rounded-[var(--radius-sm)] px-3 py-2">
            {t('freeShippingThreshold', { amount: formatPrice(freeThreshold - subtotal, locale) })}
          </p>
        )}

        {/* Divider + total — Fraunces Price · big spec */}
        <div className="pt-3 border-t border-[var(--mz-line)] mt-1">
          <div className="flex items-baseline justify-between">
            <dt className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--mz-ink-mute)]">
              {t('total')}
            </dt>
            <dd className="font-serif text-[24px] font-semibold tracking-[-0.02em] text-[var(--mz-ink)]">
              {formatPrice(total, locale)}
            </dd>
          </div>
        </div>
      </dl>

      <Button
        className="w-full mt-5"
        size="lg"
        onClick={handleCheckout}
        loading={loading}
        disabled={itemCount === 0 || loading}
        aria-label={t('checkout')}
      >
        {t('checkout')} · {formatPrice(total, locale)}
      </Button>

      <p className="text-[10px] text-center text-[var(--mz-ink-mute)] mt-3 tracking-[0.04em]">
        {t('taxIncluded')}
      </p>
    </aside>
  );
}
