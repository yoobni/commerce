'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { analytics } from '@/lib/analytics';
import { getGuestCart, removeFromGuestCart } from '@/lib/cart/guest';
import { updateCartItemQuantity, removeCartItem } from '@/lib/api/cart-client';
import { getOptionsByIds } from '@/lib/api/product-options';
import type { CartDisplay, CartItemDisplay } from '@/lib/api/cart';
import type { Locale } from '@/i18n/routing';
import { CartItemRow } from './CartItemRow';
import { CartSummary } from './CartSummary';
import { EmptyState } from '@/components/ui/EmptyState';
import { FitForHanaCard } from '@/components/ui/FitForHanaCard';
import { formatPrice } from '@/lib/format';

// Mirror of CartSummary's SHIPPING table — kept duplicated here so the mobile
// sticky-bar total stays in sync without a roundtrip through props.
const MOBILE_SHIPPING: Record<Locale, { freeThreshold: number; fee: number }> = {
  ko: { freeThreshold: 50000, fee: 3000 },
  en: { freeThreshold: 50, fee: 5 },
  ja: { freeThreshold: 5000, fee: 500 },
  de: { freeThreshold: 50, fee: 5 },
};

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

const LOCALE_PRICE_MAP: Record<Locale, { base: BasePriceKey; additional: PriceKey }> = {
  ko: { base: 'product_base_price_krw', additional: 'additional_price_krw' },
  en: { base: 'product_base_price_usd', additional: 'additional_price_usd' },
  ja: { base: 'product_base_price_jpy', additional: 'additional_price_jpy' },
  de: { base: 'product_base_price_eur', additional: 'additional_price_eur' },
};

interface CartClientProps {
  locale: Locale;
  initialCart: CartDisplay | null;
  isAuthenticated: boolean;
}

export function CartClient({ locale, initialCart, isAuthenticated }: CartClientProps) {
  const t = useTranslations('cart');
  const router = useRouter();
  const [items, setItems] = useState<CartItemDisplay[]>(initialCart?.items ?? []);
  const [guestLoading, setGuestLoading] = useState(!isAuthenticated);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  /** Load guest cart items with product details on client side */
  useEffect(() => {
    if (isAuthenticated) return;

    async function loadGuestCart() {
      const guestCart = getGuestCart();
      if (guestCart.items.length === 0) {
        setGuestLoading(false);
        return;
      }

      const optionIds = guestCart.items.map((i) => i.option_id);

      let options;
      try {
        options = await getOptionsByIds(optionIds);
      } catch {
        setGuestLoading(false);
        return;
      }

      const displayItems: CartItemDisplay[] = options.flatMap((opt) => {
        const guestItem = guestCart.items.find((g) => g.option_id === opt.id);
        if (!guestItem) return [];
        return [
          {
            id: opt.id, // use option_id as display id for guest
            quantity: guestItem.quantity,
            product_option_id: opt.id,
            color: opt.color,
            color_hex: opt.color_hex,
            size_label: opt.size_label,
            sku: opt.sku,
            stock: opt.stock,
            low_stock_threshold: opt.low_stock_threshold,
            additional_price_krw: opt.additional_price_krw,
            additional_price_usd: opt.additional_price_usd,
            additional_price_jpy: opt.additional_price_jpy,
            additional_price_eur: opt.additional_price_eur,
            product_id: opt.product.id,
            product_slug: opt.product.slug,
            product_name_ko: opt.product.name_ko,
            product_name_en: opt.product.name_en,
            product_name_ja: opt.product.name_ja,
            product_name_de: opt.product.name_de,
            product_base_price_krw: opt.product.base_price_krw,
            product_base_price_usd: opt.product.base_price_usd,
            product_base_price_jpy: opt.product.base_price_jpy,
            product_base_price_eur: opt.product.base_price_eur,
            product_thumbnail_url: opt.product.thumbnail_url,
          },
        ];
      });

      setItems(displayItems);
      setGuestLoading(false);
    }

    loadGuestCart();
  }, [isAuthenticated]);

  /** Compute subtotal */
  const subtotal = items.reduce((sum, item) => {
    const map = LOCALE_PRICE_MAP[locale];
    return sum + (item[map.base] + item[map.additional]) * item.quantity;
  }, 0);

  /** Handle quantity change */
  const handleQuantityChange = useCallback(
    async (id: string, quantity: number) => {
      // Optimistic update
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));

      if (isAuthenticated) {
        try {
          await updateCartItemQuantity(id, quantity);
        } catch {
          // Revert on failure
          setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, quantity: item.quantity } : item))
          );
        }
      } else {
        // Guest: update localStorage
        const guestCart = getGuestCart();
        const found = guestCart.items.find((i) => i.option_id === id);
        if (found) {
          found.quantity = quantity;
          if (typeof window !== 'undefined') {
            localStorage.setItem('ravi_guest_cart', JSON.stringify(guestCart));
          }
        }
      }
    },
    [isAuthenticated]
  );

  /** Handle remove */
  const handleRemove = useCallback(
    async (id: string) => {
      const removedItem = items.find((item) => item.id === id);

      // Optimistic remove
      setItems((prev) => prev.filter((item) => item.id !== id));

      // Analytics
      if (removedItem) {
        analytics.track('remove_from_cart', {
          product_id: removedItem.product_id,
          variant_id: removedItem.product_option_id,
          quantity: removedItem.quantity,
        });
      }

      if (isAuthenticated) {
        try {
          await removeCartItem(id);
        } catch {
          if (removedItem) {
            // Revert
            setItems((prev) => [...prev, removedItem]);
          }
        }
      } else {
        removeFromGuestCart(id);
      }
    },
    [items, isAuthenticated]
  );

  /** Handle checkout */
  function handleCheckout() {
    setIsCheckingOut(true);

    const map = LOCALE_PRICE_MAP[locale];
    analytics.track('begin_checkout', {
      items: items.map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name_ko,
        price: item[map.base] + item[map.additional],
        category: '',
        variant_id: item.product_option_id,
        size: item.size_label,
        image_url: item.product_thumbnail_url,
      })),
      total_value: subtotal,
      coupon_applied: false,
      coupon_code: null,
      point_used: 0,
    });

    router.push(`/${locale}/checkout`);
  }

  if (guestLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-[var(--mz-surface)] rounded-[var(--radius-lg)] p-4 flex gap-4 animate-pulse">
            <div className="w-24 h-24 rounded-[var(--radius-md)] bg-[var(--mz-bg-deep)] shrink-0" />
            <div className="flex-1 space-y-3 py-1">
              <div className="h-3 w-1/4 bg-[var(--mz-bg-deep)] rounded-[var(--radius-sm)]" />
              <div className="h-5 w-2/3 bg-[var(--mz-bg-deep)] rounded-[var(--radius-sm)]" />
              <div className="h-4 w-1/3 bg-[var(--mz-bg-deep)] rounded-[var(--radius-sm)]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const { freeThreshold, fee } = MOBILE_SHIPPING[locale];
  const mobileTotal = subtotal + (subtotal >= freeThreshold ? 0 : fee);

  return (
    <>
      {/* Title — M11 spec: "{n} pieces for Hana" Fraunces 28/500 (locale-aware copy) */}
      <h1 className="font-serif text-[28px] md:text-[34px] font-medium leading-[1.1] tracking-[-0.025em] text-[var(--mz-ink)] mb-3">
        {items.length > 0 ? t('headline', { count: itemCount }) : t('title')}
      </h1>

      {/* Fit-for-Hana card — fallback until profile system ships */}
      {items.length > 0 && (
        <div className="mb-6 max-w-md">
          <FitForHanaCard profile={null} setupHref="#" />
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          title={t('empty')}
          description={t('emptyDescription')}
          action={{
            label: t('continueShopping'),
            onClick: () => router.push(`/${locale}/products`),
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
            {/* Cart items list */}
            <section aria-label={t('itemsAriaLabel')}>
              <ul className="space-y-[10px] list-none p-0 m-0">
                {items.map((item) => (
                  <li key={item.id}>
                    <CartItemRow
                      item={item}
                      locale={locale}
                      onQuantityChange={handleQuantityChange}
                      onRemove={handleRemove}
                    />
                  </li>
                ))}
              </ul>

              {/* Continue shopping link */}
              <div className="mt-4">
                <a
                  href={`/${locale}/products`}
                  className="text-[12px] uppercase tracking-[0.1em] text-[var(--mz-ink-mute)] hover:text-[var(--mz-ink)] underline-offset-2 hover:underline transition-colors duration-150"
                >
                  ← {t('continueShopping')}
                </a>
              </div>
            </section>

            {/* Order summary */}
            <CartSummary
              subtotal={subtotal}
              locale={locale}
              itemCount={itemCount}
              onCheckout={handleCheckout}
              isCheckingOut={isCheckingOut}
            />
          </div>

          {/* Mobile sticky bottom CTA — hidden on lg+ where the sidebar takes over */}
          <div
            className="lg:hidden fixed bottom-14 left-0 right-0 z-30 border-t border-[var(--mz-line)] bg-[var(--mz-bg)] px-5 py-3"
            role="region"
            aria-label={t('summaryAriaLabel')}
          >
            <button
              type="button"
              onClick={handleCheckout}
              disabled={itemCount === 0 || isCheckingOut}
              className="w-full h-[50px] rounded-[var(--radius-md)] bg-[var(--mz-ink)] text-[var(--mz-bg)] text-[13px] font-medium tracking-[0.02em] transition-opacity hover:opacity-85 active:opacity-75 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t('checkout')} · {formatPrice(mobileTotal, locale)}
            </button>
          </div>
        </>
      )}
    </>
  );
}
