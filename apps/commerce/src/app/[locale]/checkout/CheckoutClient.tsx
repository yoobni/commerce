'use client';

import { useState, useCallback } from 'react';
import { loadTossPayments, ANONYMOUS } from '@tosspayments/tosspayments-sdk';
import { useTranslations } from 'next-intl';
import { useTrack } from '@/hooks/useTrack';
import { formatPrice } from '@commerce/shared';
import type { Currency } from '@commerce/types';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CheckoutItem {
  product_option_id: string;
  product_id: string;
  product_name: string;
  sku: string;
  thumbnail_url: string;
  size: string;
  color: string;
  unit_price: number;
  quantity: number;
}

export interface CheckoutProps {
  items: CheckoutItem[];
  currency: Currency;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  total_amount: number;
  order_number: string;
  customer_key: string | null;
  locale: string;
}

// ─── Address Form ─────────────────────────────────────────────────────────────

interface AddressFormData {
  recipient_name: string;
  phone: string;
  postal_code: string;
  address_line1: string;
  address_line2: string;
  memo: string;
}

const EMPTY_ADDRESS: AddressFormData = {
  recipient_name: '',
  phone: '',
  postal_code: '',
  address_line1: '',
  address_line2: '',
  memo: '',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CheckoutClient({
  items,
  currency,
  subtotal,
  shipping_fee,
  discount_amount,
  total_amount,
  order_number,
  customer_key,
  locale,
}: CheckoutProps) {
  const t = useTranslations('checkout');
  const track = useTrack();

  const [address, setAddress] = useState<AddressFormData>(EMPTY_ADDRESS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingTracked, setShippingTracked] = useState(false);

  const fmt = (amount: number) => formatPrice(amount, currency);

  // ── Address input handler ───────────────────────────────────────────────────
  const handleAddressChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setAddress((prev) => ({ ...prev, [name]: value }));

      // begin_checkout 이후 주소 입력 시 add_shipping_info 1회 트래킹
      if (!shippingTracked && name === 'address_line1' && value.length > 3) {
        track('add_shipping_info', {
          shipping_method: 'standard',
          country: locale === 'ko' ? 'KR' : locale === 'ja' ? 'JP' : locale === 'de' ? 'DE' : 'US',
          total_value: total_amount,
        });
        setShippingTracked(true);
      }
    },
    [shippingTracked, track, locale, total_amount]
  );

  // ── Validation ──────────────────────────────────────────────────────────────
  const validateAddress = (): boolean => {
    if (!address.recipient_name.trim()) {
      setError(t('error.nameRequired'));
      return false;
    }
    if (!address.phone.trim()) {
      setError(t('error.phoneRequired'));
      return false;
    }
    if (!address.postal_code.trim()) {
      setError(t('error.postalRequired'));
      return false;
    }
    if (!address.address_line1.trim()) {
      setError(t('error.addressRequired'));
      return false;
    }
    return true;
  };

  // ── Payment handler ─────────────────────────────────────────────────────────
  const handlePayment = useCallback(async () => {
    setError(null);
    if (!validateAddress()) return;

    setIsLoading(true);

    try {
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!clientKey) throw new Error('Toss client key not configured');

      // add_payment_info 트래킹
      track('add_payment_info', {
        payment_method: 'TOSS_PAYMENTS',
        total_value: total_amount,
      });

      const tossPayments = await loadTossPayments(clientKey);
      const payment = tossPayments.payment({
        customerKey: customer_key ?? ANONYMOUS,
      });

      const orderName =
        items.length === 1
          ? items[0].product_name
          : `${items[0].product_name} 외 ${items.length - 1}건`;

      const successUrl = new URL(
        `/${locale}/checkout/success`,
        window.location.origin
      );
      const failUrl = new URL(
        `/${locale}/checkout/fail`,
        window.location.origin
      );

      await payment.requestPayment({
        method: 'CARD',
        amount: {
          currency: currency === 'KRW' ? 'KRW' : currency === 'JPY' ? 'JPY' : currency === 'EUR' ? 'EUR' : 'USD',
          value: total_amount,
        },
        orderId: order_number,
        orderName,
        successUrl: successUrl.toString(),
        failUrl: failUrl.toString(),
        customerEmail: undefined,
        customerName: address.recipient_name,
        customerMobilePhone: address.phone.replace(/[^0-9]/g, ''),
        card: {
          useEscrow: false,
          flowMode: 'DEFAULT',
          useCardPoint: false,
          useAppCardOnly: false,
        },
      });
      // requestPayment redirects — code below won't execute on success
    } catch (err: unknown) {
      setIsLoading(false);
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code: string }).code === 'USER_CANCEL'
      ) {
        setError(t('error.cancelled'));
      } else {
        console.error('[checkout] payment error:', err);
        setError(t('error.generic'));
      }
    }
  }, [address, currency, customer_key, items, locale, order_number, t, total_amount, track, validateAddress]);

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-5xl mx-auto px-4 py-8 lg:py-12">
        <h1 className="text-2xl font-semibold text-stone-900 mb-8">{t('title')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ── Left: Address form ── */}
          <div className="lg:col-span-3 space-y-6">
            {/* Delivery section */}
            <section className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-semibold text-stone-900 mb-4">{t('shipping.title')}</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="recipient_name" className="block text-xs font-medium text-stone-500 mb-1">
                      {t('shipping.recipientName')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="recipient_name"
                      name="recipient_name"
                      type="text"
                      autoComplete="name"
                      value={address.recipient_name}
                      onChange={handleAddressChange}
                      className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                      placeholder={t('shipping.recipientNamePlaceholder')}
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-xs font-medium text-stone-500 mb-1">
                      {t('shipping.phone')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={address.phone}
                      onChange={handleAddressChange}
                      className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                      placeholder={t('shipping.phonePlaceholder')}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="postal_code" className="block text-xs font-medium text-stone-500 mb-1">
                    {t('shipping.postalCode')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="postal_code"
                    name="postal_code"
                    type="text"
                    autoComplete="postal-code"
                    value={address.postal_code}
                    onChange={handleAddressChange}
                    className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                    placeholder={t('shipping.postalCodePlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="address_line1" className="block text-xs font-medium text-stone-500 mb-1">
                    {t('shipping.address')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="address_line1"
                    name="address_line1"
                    type="text"
                    autoComplete="address-line1"
                    value={address.address_line1}
                    onChange={handleAddressChange}
                    className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                    placeholder={t('shipping.addressPlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="address_line2" className="block text-xs font-medium text-stone-500 mb-1">
                    {t('shipping.addressDetail')}
                  </label>
                  <input
                    id="address_line2"
                    name="address_line2"
                    type="text"
                    autoComplete="address-line2"
                    value={address.address_line2}
                    onChange={handleAddressChange}
                    className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                    placeholder={t('shipping.addressDetailPlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="memo" className="block text-xs font-medium text-stone-500 mb-1">
                    {t('shipping.memo')}
                  </label>
                  <textarea
                    id="memo"
                    name="memo"
                    rows={2}
                    value={address.memo}
                    onChange={handleAddressChange}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent resize-none"
                    placeholder={t('shipping.memoPlaceholder')}
                  />
                </div>
              </div>
            </section>

            {/* Payment method info */}
            <section className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-semibold text-stone-900 mb-3">{t('payment.title')}</h2>
              <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-stone-900 bg-stone-50">
                <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-900">{t('payment.card')}</p>
                  <p className="text-xs text-stone-500">{t('payment.cardDesc')}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-stone-400">{t('payment.poweredBy')}</p>
            </section>
          </div>

          {/* ── Right: Order summary ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-6">
              <h2 className="text-base font-semibold text-stone-900 mb-4">{t('summary.title')}</h2>

              {/* Items */}
              <ul className="space-y-3 mb-6">
                {items.map((item) => (
                  <li key={item.product_option_id} className="flex gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumbnail_url || '/placeholder-product.jpg'}
                      alt={item.product_name}
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-lg object-cover bg-stone-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate">{item.product_name}</p>
                      <p className="text-xs text-stone-500">{item.size} / {item.color}</p>
                      <p className="text-xs text-stone-500">{t('summary.qty')}: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-stone-900 flex-shrink-0">
                      {fmt(item.unit_price * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>

              {/* Price breakdown */}
              <div className="border-t border-stone-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-stone-600">
                  <span>{t('summary.subtotal')}</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-stone-600">
                  <span>{t('summary.shipping')}</span>
                  <span>{shipping_fee === 0 ? t('summary.free') : fmt(shipping_fee)}</span>
                </div>
                {discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>{t('summary.discount')}</span>
                    <span>-{fmt(discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold text-stone-900 pt-2 border-t border-stone-100">
                  <span>{t('summary.total')}</span>
                  <span>{fmt(total_amount)}</span>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div role="alert" className="mt-4 p-3 rounded-xl bg-red-50 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* CTA */}
              <button
                type="button"
                onClick={handlePayment}
                disabled={isLoading}
                aria-busy={isLoading}
                className="mt-5 w-full h-12 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 active:bg-stone-950 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? t('paying') : `${fmt(total_amount)} ${t('pay')}`}
              </button>

              <p className="mt-3 text-xs text-center text-stone-400">{t('terms')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
