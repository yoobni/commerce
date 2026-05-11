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
    <aside className="bg-[var(--mz-surface)] rounded-[var(--radius-lg)] p-6 border border-[var(--mz-line)] h-fit sticky top-6" aria-label="주문 요약">
      {/* Section title — Fraunces Title spec: 24/29/500/-0.02em */}
      <h2 className="font-serif text-[20px] font-[500] leading-[1.2] tracking-[-0.02em] text-[var(--mz-ink)] mb-5">
        {t('title')} ({itemCount})
      </h2>

      <dl className="space-y-3">
        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <dt className="text-[13px] text-[var(--mz-ink-soft)]">{t('subtotal')}</dt>
          <dd className="text-[13px] font-medium text-[var(--mz-ink)]">
            {formatPrice(subtotal, locale)}
          </dd>
        </div>

        {/* Shipping */}
        <div className="flex items-center justify-between">
          <dt className="text-[13px] text-[var(--mz-ink-soft)]">{t('shipping')}</dt>
          <dd
            className={
              isFreeShipping
                ? 'text-[13px] text-[var(--color-success)] font-medium'
                : 'text-[13px] font-medium text-[var(--mz-ink)]'
            }
          >
            {isFreeShipping ? t('freeShipping') : formatPrice(shippingFee, locale)}
          </dd>
        </div>

        {/* Free shipping progress (only if not yet free) */}
        {!isFreeShipping && (
          <div className="text-[12px] text-[var(--mz-ink-mute)] bg-[var(--mz-bg)] rounded-[var(--radius-sm)] px-3 py-2">
            {t('freeShippingThreshold', { amount: formatPrice(freeThreshold - subtotal, locale) })}
          </div>
        )}

        {/* Divider + Total — Price type: Fraunces 22/600 */}
        <div className="pt-4 border-t border-[var(--mz-line)]">
          <div className="flex items-center justify-between">
            <dt className="text-[13px] font-medium text-[var(--mz-ink)]">{t('total')}</dt>
            <dd className="font-serif text-[22px] font-[600] leading-[26px] text-[var(--mz-ink)]">
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
        {t('checkout')}
      </Button>

      <p className="text-[12px] text-center text-[var(--mz-ink-mute)] mt-3">
        {t('taxIncluded')}
      </p>
    </aside>
  );
}
