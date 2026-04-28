'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { useTrack } from '@/hooks/useTrack';
import { analytics } from '@/lib/analytics';
import { Button } from '@/components/ui/Button';
import { addToCartAction } from '@/lib/cart/actions';
import { addToGuestCart } from '@/lib/cart/guest';
import type { ProductOption, Locale } from '@commerce/types';

const LOCALE_CURRENCY = {
  ko: 'KRW',
  en: 'USD',
  ja: 'JPY',
  de: 'EUR',
} as const;

interface PDPAddToCartProps {
  selectedOption: ProductOption | null;
  productId: string;
  productName: string;
  productCategory: string;
  price: number;
  locale: Locale;
  isAuthenticated: boolean;
}

export function PDPAddToCart({
  selectedOption,
  productId,
  productName,
  productCategory,
  price,
  locale,
  isAuthenticated,
}: PDPAddToCartProps) {
  const t = useTranslations('product');
  const track = useTrack();
  const [isPending, startTransition] = useTransition();
  const [justAdded, setJustAdded] = useState(false);

  const currency = LOCALE_CURRENCY[locale];
  const isOutOfStock = selectedOption !== null && selectedOption.stock === 0;
  const isLowStock =
    selectedOption !== null &&
    selectedOption.stock > 0 &&
    selectedOption.stock <= selectedOption.low_stock_threshold;

  function handleAddToCart() {
    if (!selectedOption) return;

    startTransition(async () => {
      try {
        if (isAuthenticated) {
          await addToCartAction(selectedOption.id, 1, currency);
        } else {
          addToGuestCart(selectedOption.id, 1, currency);
        }

        track('add_to_cart', {
          product_id: productId,
          product_name: productName,
          price,
          quantity: 1,
          size: selectedOption.size?.label ?? null,
          variant_id: selectedOption.id,
          category: productCategory,
          list_name: 'pdp',
          community_inflow: analytics.getCommunityInflow(),
        });

        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2500);
      } catch {
        // silently fail — user-facing feedback via justAdded state
      }
    });
  }

  const buttonLabel = isOutOfStock
    ? t('outOfStock')
    : justAdded
      ? t('addedToCart')
      : t('addToCart');

  return (
    <div className="space-y-3">
      {/* Low stock warning */}
      {isLowStock && (
        <p className="text-xs font-medium text-[var(--color-warning)]" role="alert">
          {t('lowStock', { count: selectedOption!.stock })}
        </p>
      )}

      {/* Select option hint */}
      {!selectedOption && (
        <p className="text-xs text-[var(--color-text-tertiary)]">{t('selectOption')}</p>
      )}

      <Button
        variant="primary"
        size="lg"
        className={cn(
          'w-full transition-all duration-200',
          justAdded && 'bg-[var(--color-success)]'
        )}
        disabled={!selectedOption || isOutOfStock || isPending}
        loading={isPending}
        onClick={handleAddToCart}
        aria-label={buttonLabel}
      >
        {justAdded ? (
          <>
            <CheckIcon />
            {buttonLabel}
          </>
        ) : (
          buttonLabel
        )}
      </Button>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
