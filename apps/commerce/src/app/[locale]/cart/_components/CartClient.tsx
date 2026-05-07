'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { analytics } from '@/lib/analytics';
import { getGuestCart, removeFromGuestCart } from '@/lib/cart/guest';
import { updateCartItemQuantityAction, removeCartItemAction } from '@/lib/cart/actions';
import { createClient } from '@/lib/supabase/client';
import type { CartDisplay, CartItemDisplay } from '@/lib/cart/queries';
import type { Locale } from '@/i18n/routing';
import { CartItemRow } from './CartItemRow';
import { CartSummary } from './CartSummary';
import { EmptyState } from '@/components/ui/EmptyState';

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
      const supabase = createClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: rawOptions } = await (supabase as any)
        .from('product_options')
        .select(
          `
          id,
          color,
          color_hex,
          sku,
          additional_price_krw,
          additional_price_usd,
          additional_price_jpy,
          additional_price_eur,
          stock,
          low_stock_threshold,
          sizes ( label ),
          products!inner (
            id,
            slug,
            name_ko,
            name_en,
            name_ja,
            name_de,
            base_price_krw,
            base_price_usd,
            base_price_jpy,
            base_price_eur,
            thumbnail_url
          )
        `
        )
        .in('id', optionIds);

      if (!rawOptions) {
        setGuestLoading(false);
        return;
      }

      const displayItems: CartItemDisplay[] = (rawOptions as Record<string, unknown>[]).flatMap(
        (opt) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const o = opt as any;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const prod = o.products as any;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const size = o.sizes as any;
          const guestItem = guestCart.items.find((g) => g.option_id === o.id);
          if (!guestItem) return [];
          return [
            {
              id: o.id as string, // use option_id as display id for guest
              quantity: guestItem.quantity,
              product_option_id: o.id as string,
              color: o.color as string,
              color_hex: (o.color_hex as string | null) ?? null,
              size_label: (size?.label as string | null) ?? null,
              sku: o.sku as string,
              stock: o.stock as number,
              low_stock_threshold: o.low_stock_threshold as number,
              additional_price_krw: o.additional_price_krw as number,
              additional_price_usd: o.additional_price_usd as number,
              additional_price_jpy: o.additional_price_jpy as number,
              additional_price_eur: o.additional_price_eur as number,
              product_id: prod.id as string,
              product_slug: prod.slug as string,
              product_name_ko: prod.name_ko as string,
              product_name_en: prod.name_en as string,
              product_name_ja: prod.name_ja as string,
              product_name_de: prod.name_de as string,
              product_base_price_krw: prod.base_price_krw as number,
              product_base_price_usd: prod.base_price_usd as number,
              product_base_price_jpy: prod.base_price_jpy as number,
              product_base_price_eur: prod.base_price_eur as number,
              product_thumbnail_url: prod.thumbnail_url as string,
            },
          ];
        }
      );

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
        const result = await updateCartItemQuantityAction(id, quantity);
        if (!result.success) {
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
        const result = await removeCartItemAction(id);
        if (!result.success && removedItem) {
          // Revert
          setItems((prev) => [...prev, removedItem]);
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
          <div key={i} className="bg-white rounded-xl p-4 flex gap-4 shadow-sm animate-pulse">
            <div className="w-24 h-24 rounded-lg bg-[var(--color-neutral-100)] shrink-0" />
            <div className="flex-1 space-y-3 py-1">
              <div className="h-3 w-1/4 bg-[var(--color-neutral-100)] rounded" />
              <div className="h-5 w-2/3 bg-[var(--color-neutral-100)] rounded" />
              <div className="h-4 w-1/3 bg-[var(--color-neutral-100)] rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Page title */}
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">
        {t('title')}
        {items.length > 0 && (
          <span className="ml-2 text-base font-normal text-[var(--color-text-secondary)]">
            ({items.length})
          </span>
        )}
      </h1>

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
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
          {/* Cart items list */}
          <section aria-label="장바구니 상품 목록">
            <ul className="space-y-3 list-none p-0 m-0">
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
                className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] underline-offset-2 hover:underline transition-colors"
              >
                ← {t('continueShopping')}
              </a>
            </div>
          </section>

          {/* Order summary */}
          <CartSummary
            subtotal={subtotal}
            locale={locale}
            itemCount={items.reduce((sum, i) => sum + i.quantity, 0)}
            onCheckout={handleCheckout}
            isCheckingOut={isCheckingOut}
          />
        </div>
      )}
    </>
  );
}
