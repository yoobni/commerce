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

export function CartSummary({ subtotal, locale, itemCount, onCheckout, isCheckingOut = false }: CartSummaryProps) {
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
      className="bg-white rounded-xl p-6 shadow-sm h-fit sticky top-6"
      aria-label="주문 요약"
    >
      <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">
        {t('title')} ({itemCount})
      </h2>

      <dl className="space-y-3 text-sm">
        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <dt className="text-[var(--color-text-secondary)]">{t('subtotal')}</dt>
          <dd className="font-medium text-[var(--color-text-primary)]">
            {formatPrice(subtotal, locale)}
          </dd>
        </div>

        {/* Shipping */}
        <div className="flex items-center justify-between">
          <dt className="text-[var(--color-text-secondary)]">{t('shipping')}</dt>
          <dd className={isFreeShipping ? 'text-[var(--color-success,#22c55e)] font-medium' : 'font-medium text-[var(--color-text-primary)]'}>
            {isFreeShipping ? t('freeShipping') : formatPrice(shippingFee, locale)}
          </dd>
        </div>

        {/* Free shipping progress (only if not yet free) */}
        {!isFreeShipping && (
          <div className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-neutral-50)] rounded-lg px-3 py-2">
            {t('freeShippingThreshold', { amount: formatPrice(freeThreshold - subtotal, locale) })}
          </div>
        )}

        {/* Divider */}
        <div className="pt-3 border-t border-[var(--color-neutral-100)]">
          <div className="flex items-center justify-between">
            <dt className="font-semibold text-[var(--color-text-primary)]">{t('total')}</dt>
            <dd className="font-bold text-lg text-[var(--color-text-primary)]">
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

      <p className="text-xs text-center text-[var(--color-text-secondary)] mt-3">
        {t('taxIncluded')}
      </p>
    </aside>
  );
}
