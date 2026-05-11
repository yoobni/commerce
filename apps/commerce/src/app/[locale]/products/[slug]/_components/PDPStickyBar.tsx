'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { useTrack } from '@/hooks/useTrack';
import { analytics } from '@/lib/analytics';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { WishlistButton } from '@/components/product/WishlistButton';
import { addToCartAction } from '@/lib/cart/actions';
import { addToGuestCart } from '@/lib/cart/guest';
import { formatPrice } from '@/lib/format';
import type { ProductOption, Locale } from '@commerce/types';

const LOCALE_CURRENCY = {
  ko: 'KRW',
  en: 'USD',
  ja: 'JPY',
  de: 'EUR',
} as const;

interface PDPStickyBarProps {
  selectedOption: ProductOption | null;
  price: number;
  locale: Locale;
  productId: string;
  productName: string;
  productCategory: string;
  isAuthenticated: boolean;
  onOpenSheet: () => void;
}

export function PDPStickyBar({
  selectedOption,
  price,
  locale,
  productId,
  productName,
  productCategory,
  isAuthenticated,
  onOpenSheet,
}: PDPStickyBarProps) {
  const t = useTranslations('product');
  const { toast } = useToast();
  const track = useTrack();
  const [isPending, startTransition] = useTransition();
  const [justAdded, setJustAdded] = useState(false);

  const currency = LOCALE_CURRENCY[locale];
  const isOutOfStock = selectedOption !== null && selectedOption.stock === 0;
  const formattedPrice = formatPrice(price, locale);

  function handleClick() {
    track('add_to_cart_clicked', {
      product_id: productId,
      source: 'pdp_sticky',
      has_selection: selectedOption !== null,
    });

    if (!selectedOption) {
      onOpenSheet();
      return;
    }

    if (isOutOfStock || isPending) return;

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
          list_name: 'pdp_sticky',
          community_inflow: analytics.getCommunityInflow(),
        });

        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2500);
      } catch {
        toast(t('addToCartError'), 'error');
      }
    });
  }

  const buttonLabel = isOutOfStock
    ? t('outOfStock')
    : justAdded
      ? t('addedToCart')
      : `${t('addToCart')} · ${formattedPrice}`;

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 md:hidden',
        'bg-white border-t border-[var(--color-border)]',
        'px-4 pt-3',
        'pb-[max(12px,env(safe-area-inset-bottom))]',
      )}
    >
      <div className="flex items-center gap-3">
        <WishlistButton
          productId={productId}
          productName={productName}
          price={price}
          category={productCategory}
          locale={locale}
          isAuthenticated={isAuthenticated}
        />
        <Button
          variant="primary"
          size="lg"
          className={cn(
            'flex-1 transition-all duration-200',
            justAdded && '!bg-[var(--color-success)]',
            !selectedOption && 'opacity-60',
          )}
          disabled={isOutOfStock || isPending}
          loading={isPending}
          onClick={handleClick}
          aria-label={selectedOption ? buttonLabel : t('selectOption')}
        >
          {justAdded ? (
            <>
              <CheckIcon />
              {t('addedToCart')}
            </>
          ) : (
            buttonLabel
          )}
        </Button>
      </div>
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
