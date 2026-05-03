'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/cn';
import type { CartDisplay } from '@/lib/cart/queries';
import type { Address, Currency, Locale } from '@commerce/types';
import { formatPrice } from '@/lib/format';
import { useTrack } from '@/hooks/useTrack';
import { validateCouponAction } from '@/lib/coupons/actions';
import { createOrder } from '@/lib/orders/actions';

type Step = 'shipping' | 'payment' | 'confirm';

interface CheckoutClientProps {
  cart: CartDisplay;
  addresses: Address[];
  locale: Locale;
  userPoints: number;
}

const STEP_ORDER: Step[] = ['shipping', 'payment', 'confirm'];

const DELIVERY_NOTES = [
  { ko: '문 앞에 놓아주세요', en: 'Leave at door' },
  { ko: '경비실에 맡겨주세요', en: 'Leave at front desk' },
  { ko: '부재 시 연락주세요', en: 'Call if absent' },
];

const LOCALE_CURRENCY: Record<Locale, Currency> = {
  ko: 'KRW',
  en: 'USD',
  ja: 'JPY',
  de: 'EUR',
};

function getProductName(item: CartDisplay['items'][number], locale: Locale): string {
  if (locale === 'ko') return item.product_name_ko;
  if (locale === 'ja') return item.product_name_ja;
  if (locale === 'de') return item.product_name_de;
  return item.product_name_en;
}

function getItemPrice(item: CartDisplay['items'][number], locale: Locale): number {
  const base =
    locale === 'ko'
      ? item.product_base_price_krw
      : locale === 'ja'
        ? item.product_base_price_jpy
        : locale === 'de'
          ? item.product_base_price_eur
          : item.product_base_price_usd;
  const extra =
    locale === 'ko'
      ? item.additional_price_krw
      : locale === 'ja'
        ? item.additional_price_jpy
        : locale === 'de'
          ? item.additional_price_eur
          : item.additional_price_usd;
  return (base + extra) * item.quantity;
}

export function CheckoutClient({ cart, addresses, locale, userPoints }: CheckoutClientProps) {
  const t = useTranslations('checkout');
  const router = useRouter();
  const track = useTrack();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<Step>('shipping');

  // Shipping form state
  const defaultAddress = addresses.find((a) => a.is_default) ?? addresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    defaultAddress?.id ?? null
  );
  const [recipient, setRecipient] = useState(defaultAddress?.recipient_name ?? '');
  const [phone, setPhone] = useState(defaultAddress?.phone ?? '');
  const [postalCode, setPostalCode] = useState(defaultAddress?.postal_code ?? '');
  const [addressLine1, setAddressLine1] = useState(defaultAddress?.address_line1 ?? '');
  const [addressLine2, setAddressLine2] = useState(defaultAddress?.address_line2 ?? '');
  const [deliveryNote, setDeliveryNote] = useState('');

  // Payment state
  type PayMethod = 'card' | 'kakao' | 'naver' | 'toss' | 'transfer';
  const [payMethod, setPayMethod] = useState<PayMethod>('card');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponValidating, setCouponValidating] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponIssuanceId, setCouponIssuanceId] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponName, setCouponName] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  // Points state
  const [pointsInput, setPointsInput] = useState('');
  const [pointsToUse, setPointsToUse] = useState(0);
  const [pointsError, setPointsError] = useState<string | null>(null);

  // Order error
  const [orderError, setOrderError] = useState<string | null>(null);

  const subtotal = cart.items.reduce((sum, item) => sum + getItemPrice(item, locale), 0);
  const shippingFee =
    subtotal >= (locale === 'ko' ? 50000 : locale === 'en' ? 50 : locale === 'ja' ? 7000 : 50)
      ? 0
      : locale === 'ko'
        ? 3000
        : locale === 'en'
          ? 10
          : locale === 'ja'
            ? 1000
            : 8;
  const maxPointsUsable = Math.min(
    userPoints,
    Math.floor((subtotal + shippingFee - couponDiscount) * 0.3)
  );
  const total = Math.max(0, subtotal + shippingFee - couponDiscount - pointsToUse);

  function handleAddressSelect(addr: Address) {
    setSelectedAddressId(addr.id);
    setRecipient(addr.recipient_name);
    setPhone(addr.phone);
    setPostalCode(addr.postal_code);
    setAddressLine1(addr.address_line1);
    setAddressLine2(addr.address_line2 ?? '');
  }

  async function handleApplyCoupon() {
    if (!couponCode || couponValidating) return;
    setCouponValidating(true);
    setCouponError(null);

    const result = await validateCouponAction(couponCode, subtotal + shippingFee);
    setCouponValidating(false);

    if (!result.valid || !result.coupon) {
      const errMsg =
        result.error === 'min_order_amount'
          ? '최소 주문 금액을 충족하지 않습니다'
          : result.error === 'no_issuance'
            ? '발급된 쿠폰이 없습니다'
            : t('coupon.invalidCode');
      setCouponError(errMsg);
      return;
    }

    setCouponApplied(true);
    setCouponIssuanceId(result.coupon.issuanceId);
    setCouponDiscount(result.coupon.discountAmount);
    setCouponName(result.coupon.name);
  }

  function handleRemoveCoupon() {
    setCouponApplied(false);
    setCouponIssuanceId(null);
    setCouponDiscount(0);
    setCouponName('');
    setCouponCode('');
    setCouponError(null);
    const newMax = Math.min(userPoints, Math.floor((subtotal + shippingFee) * 0.3));
    if (pointsToUse > newMax) {
      setPointsToUse(0);
      setPointsInput('');
    }
  }

  function handleApplyPoints() {
    const pts = parseInt(pointsInput, 10);
    setPointsError(null);
    if (isNaN(pts) || pts <= 0) {
      setPointsError('포인트를 입력해 주세요');
      return;
    }
    if (pts < 1000) {
      setPointsError('최소 1,000P 이상 사용 가능합니다');
      return;
    }
    if (pts > userPoints) {
      setPointsError('보유 포인트가 부족합니다');
      return;
    }
    if (pts > maxPointsUsable) {
      setPointsError(`최대 ${maxPointsUsable.toLocaleString()}P까지 사용 가능합니다`);
      return;
    }
    setPointsToUse(pts);
  }

  function handleRemovePoints() {
    setPointsToUse(0);
    setPointsInput('');
    setPointsError(null);
  }

  function handleNextStep() {
    const currentIndex = STEP_ORDER.indexOf(step);
    if (currentIndex < STEP_ORDER.length - 1) {
      setStep(STEP_ORDER[currentIndex + 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handlePrevStep() {
    const currentIndex = STEP_ORDER.indexOf(step);
    if (currentIndex > 0) {
      setStep(STEP_ORDER[currentIndex - 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handlePlaceOrder() {
    setOrderError(null);
    startTransition(async () => {
      track('begin_checkout', {
        items: cart.items.map((item) => ({
          product_id: item.product_id,
          product_name: getProductName(item, locale),
          quantity: item.quantity,
          price: getItemPrice(item, locale) / item.quantity,
          category: '',
        })),
        total_value: total,
        coupon_applied: couponApplied,
        coupon_code: couponApplied ? couponCode : null,
        point_used: pointsToUse,
      });

      const result = await createOrder({
        cartId: cart.id,
        selectedAddressId,
        shippingForm: {
          recipient_name: recipient,
          phone,
          postal_code: postalCode,
          address_line1: addressLine1,
          address_line2: addressLine2 || null,
        },
        deliveryNote: deliveryNote || null,
        paymentMethod: payMethod,
        couponIssuanceId,
        couponDiscount,
        pointsToUse,
        subtotal,
        shippingFee,
        totalAmount: total,
        currency: LOCALE_CURRENCY[locale],
        locale,
      });

      if (!result.success) {
        const errMsg =
          result.error === 'cart_empty'
            ? '장바구니가 비어있습니다'
            : result.error === 'stock_insufficient'
              ? '일부 상품의 재고가 부족합니다'
              : result.error === 'points_min_1000'
                ? '포인트는 최소 1,000P 이상 사용해야 합니다'
                : result.error === 'points_insufficient'
                  ? '포인트 잔액이 부족합니다'
                  : '주문 처리 중 오류가 발생했습니다';
        setOrderError(errMsg);
        return;
      }

      const confirmRes = await fetch('/api/payments/mock-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: result.orderId, amount: total }),
      });

      if (!confirmRes.ok) {
        setOrderError('결제 처리 중 오류가 발생했습니다');
        return;
      }

      const confirmData = (await confirmRes.json()) as {
        success: boolean;
        orderId: string;
        orderNumber: string;
      };

      track('purchase', {
        order_id: confirmData.orderNumber,
        total_value: total,
        tax: 0,
        shipping_cost: shippingFee,
        coupon_code: couponApplied ? couponCode : null,
        point_used: pointsToUse,
        items: cart.items.map((item) => ({
          product_id: item.product_id,
          product_name: getProductName(item, locale),
          quantity: item.quantity,
          price: getItemPrice(item, locale) / item.quantity,
          category: '',
        })),
        is_first_purchase: false,
        payment_method: payMethod,
      });

      router.push(`/checkout/success?order_id=${confirmData.orderNumber}`);
    });
  }

  const stepLabels: Record<Step, string> = {
    shipping: t('steps.shipping'),
    payment: t('steps.payment'),
    confirm: t('steps.confirm'),
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
      {/* Left: Steps */}
      <div className="space-y-6">
        {/* Step indicator */}
        <nav aria-label="Checkout steps">
          <ol className="flex items-center gap-0">
            {STEP_ORDER.map((s, i) => {
              const idx = STEP_ORDER.indexOf(step);
              const done = i < idx;
              const active = s === step;
              return (
                <li key={s} className="flex items-center">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                        active
                          ? 'bg-[var(--color-brand-primary)] text-white'
                          : done
                            ? 'bg-[var(--color-brand-primary)]/20 text-[var(--color-brand-primary)]'
                            : 'bg-[var(--color-neutral-200)] text-[var(--color-text-tertiary)]'
                      )}
                      aria-current={active ? 'step' : undefined}
                    >
                      {done ? '✓' : i + 1}
                    </span>
                    <span
                      className={cn(
                        'text-sm font-medium',
                        active
                          ? 'text-[var(--color-text-primary)]'
                          : 'text-[var(--color-text-tertiary)]'
                      )}
                    >
                      {stepLabels[s]}
                    </span>
                  </div>
                  {i < STEP_ORDER.length - 1 && (
                    <div
                      className="w-8 md:w-16 h-px bg-[var(--color-border)] mx-3"
                      aria-hidden="true"
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Step: Shipping */}
        {step === 'shipping' && (
          <section aria-labelledby="shipping-heading" className="space-y-5">
            <h2
              id="shipping-heading"
              className="text-lg font-semibold text-[var(--color-text-primary)]"
            >
              {t('shipping.title')}
            </h2>

            {/* Saved addresses */}
            {addresses.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                  {t('shipping.useRegisteredAddress')}
                </p>
                <div className="space-y-2">
                  {addresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => handleAddressSelect(addr)}
                      className={cn(
                        'w-full text-left p-4 rounded-lg border transition-colors',
                        selectedAddressId === addr.id
                          ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/5'
                          : 'border-[var(--color-border)] hover:border-[var(--color-brand-primary)]/50'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {addr.label && (
                          <span className="text-xs font-semibold text-[var(--color-brand-accent)]">
                            {addr.label}
                          </span>
                        )}
                        {addr.is_default && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--color-neutral-100)] text-[var(--color-text-tertiary)]">
                            기본
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        {addr.recipient_name} · {addr.phone}
                      </p>
                      <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                        {addr.address_line1} {addr.address_line2}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Shipping form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('shipping.recipient')}
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder={t('shipping.recipientPlaceholder')}
                required
              />
              <Input
                label={t('shipping.phone')}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('shipping.phonePlaceholder')}
                type="tel"
                required
              />
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-3">
              <Input
                label="우편번호"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="00000"
                required
              />
              <Input
                label={t('shipping.address')}
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder={t('shipping.addressSearch')}
                required
              />
            </div>
            <Input
              label={t('shipping.addressDetail')}
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              placeholder={t('shipping.addressDetailPlaceholder')}
            />

            {/* Delivery note */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--color-text-primary)]">
                {t('shipping.deliveryNote')}
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {DELIVERY_NOTES.map((note) => {
                  const label = locale === 'ko' ? note.ko : note.en;
                  return (
                    <button
                      key={note.ko}
                      type="button"
                      onClick={() => setDeliveryNote(label)}
                      className={cn(
                        'px-3 py-1.5 rounded-full border text-xs font-medium transition-colors',
                        deliveryNote === label
                          ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]'
                          : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand-primary)]/50'
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <textarea
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                placeholder={t('shipping.deliveryNotePlaceholder')}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 resize-none transition"
              />
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleNextStep}
              disabled={!recipient || !phone || !addressLine1}
            >
              {t('steps.payment')} →
            </Button>
          </section>
        )}

        {/* Step: Payment */}
        {step === 'payment' && (
          <section aria-labelledby="payment-heading" className="space-y-6">
            <h2
              id="payment-heading"
              className="text-lg font-semibold text-[var(--color-text-primary)]"
            >
              {t('payment.title')}
            </h2>

            {/* Payment methods */}
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { key: 'card', label: t('payment.creditCard') },
                  { key: 'kakao', label: t('payment.kakaoPay') },
                  { key: 'naver', label: t('payment.naverPay') },
                  { key: 'transfer', label: t('payment.bankTransfer') },
                ] as { key: PayMethod; label: string }[]
              ).map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPayMethod(key)}
                  className={cn(
                    'py-4 px-4 rounded-lg border text-sm font-medium text-center transition-all',
                    payMethod === key
                      ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/5 text-[var(--color-brand-primary)]'
                      : 'border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-brand-primary)]/50'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Coupon */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                {t('coupon.title')}
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setCouponError(null);
                  }}
                  placeholder={t('coupon.couponPlaceholder')}
                  disabled={couponApplied}
                  className="flex-1 h-10 px-3 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 disabled:bg-[var(--color-neutral-50)] transition"
                />
                {couponApplied ? (
                  <Button variant="secondary" size="sm" onClick={handleRemoveCoupon}>
                    {t('coupon.remove')}
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleApplyCoupon}
                    disabled={!couponCode || couponValidating}
                    loading={couponValidating}
                  >
                    {t('coupon.apply')}
                  </Button>
                )}
              </div>
              {couponError && (
                <p className="text-xs text-red-500 font-medium">{couponError}</p>
              )}
              {couponApplied && (
                <p className="text-xs text-green-600 font-medium">
                  {t('coupon.applied')} — {couponName} (-{formatPrice(couponDiscount, locale)})
                </p>
              )}
            </div>

            {/* Points */}
            {userPoints > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {t('coupon.points')}
                </p>
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  {t('coupon.availablePoints')}: {userPoints.toLocaleString()}P
                  {maxPointsUsable > 0 &&
                    ` · 최대 ${maxPointsUsable.toLocaleString()}P (주문금액의 30%)`}
                </p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={pointsInput}
                    onChange={(e) => {
                      setPointsInput(e.target.value);
                      setPointsError(null);
                    }}
                    placeholder="0"
                    disabled={pointsToUse > 0 || maxPointsUsable <= 0}
                    min="1000"
                    max={maxPointsUsable}
                    step="1000"
                    className="flex-1 h-10 px-3 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 disabled:bg-[var(--color-neutral-50)] transition"
                  />
                  {pointsToUse > 0 ? (
                    <Button variant="secondary" size="sm" onClick={handleRemovePoints}>
                      취소
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleApplyPoints}
                      disabled={!pointsInput || maxPointsUsable <= 0}
                    >
                      {t('coupon.apply')}
                    </Button>
                  )}
                </div>
                {pointsError && (
                  <p className="text-xs text-red-500 font-medium">{pointsError}</p>
                )}
                {pointsToUse > 0 && (
                  <p className="text-xs text-green-600 font-medium">
                    -{pointsToUse.toLocaleString()}P 적용됨
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" size="lg" className="flex-1" onClick={handlePrevStep}>
                ← {t('steps.shipping')}
              </Button>
              <Button variant="primary" size="lg" className="flex-1" onClick={handleNextStep}>
                {t('steps.confirm')} →
              </Button>
            </div>
          </section>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && (
          <section aria-labelledby="confirm-heading" className="space-y-6">
            <h2
              id="confirm-heading"
              className="text-lg font-semibold text-[var(--color-text-primary)]"
            >
              {t('steps.confirm')}
            </h2>

            {/* Shipping summary */}
            <div className="rounded-lg border border-[var(--color-border)] p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                {t('shipping.title')}
              </p>
              <p className="text-sm text-[var(--color-text-primary)] font-medium">
                {recipient} · {phone}
              </p>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {postalCode} {addressLine1} {addressLine2}
              </p>
              {deliveryNote && (
                <p className="text-xs text-[var(--color-text-tertiary)] italic">{deliveryNote}</p>
              )}
            </div>

            {/* Payment summary */}
            <div className="rounded-lg border border-[var(--color-border)] p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                {t('payment.title')}
              </p>
              <p className="text-sm text-[var(--color-text-primary)] font-medium">
                {payMethod === 'card' && t('payment.creditCard')}
                {payMethod === 'kakao' && t('payment.kakaoPay')}
                {payMethod === 'naver' && t('payment.naverPay')}
                {payMethod === 'transfer' && t('payment.bankTransfer')}
              </p>
              {couponApplied && (
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  쿠폰: {couponName} (-{formatPrice(couponDiscount, locale)})
                </p>
              )}
              {pointsToUse > 0 && (
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  포인트: -{pointsToUse.toLocaleString()}P
                </p>
              )}
            </div>

            {/* Order error */}
            {orderError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-600 font-medium">{orderError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" size="lg" className="flex-1" onClick={handlePrevStep}>
                ← {t('steps.payment')}
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={handlePlaceOrder}
                loading={isPending}
              >
                {t('summary.placeOrder')} · {formatPrice(total, locale)}
              </Button>
            </div>
          </section>
        )}
      </div>

      {/* Right: Order summary sidebar */}
      <aside
        aria-label={t('summary.title')}
        className="space-y-4 lg:sticky lg:top-24 lg:self-start"
      >
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
            {t('summary.title')}
          </h2>

          {/* Items */}
          <ul className="space-y-3 mb-5" aria-label="Cart items">
            {cart.items.map((item) => (
              <li key={item.id} className="flex gap-3">
                <div className="relative w-14 h-16 rounded overflow-hidden bg-[var(--color-neutral-100)] shrink-0">
                  <Image
                    src={item.product_thumbnail_url}
                    alt={getProductName(item, locale)}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--color-brand-primary)] text-white text-[10px] font-bold flex items-center justify-center">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                    {getProductName(item, locale)}
                  </p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    {item.color} / {item.size_label}
                  </p>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)] mt-0.5">
                    {formatPrice(getItemPrice(item, locale), locale)}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* Price breakdown */}
          <div className="space-y-2 border-t border-[var(--color-border)] pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">{t('summary.subtotal')}</span>
              <span className="text-[var(--color-text-primary)]">
                {formatPrice(subtotal, locale)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">{t('summary.shippingFee')}</span>
              <span className="text-[var(--color-text-primary)]">
                {shippingFee === 0 ? t('summary.freeShipping') : formatPrice(shippingFee, locale)}
              </span>
            </div>
            {couponApplied && (
              <div className="flex justify-between text-sm text-green-600">
                <span>{t('summary.couponDiscount')}</span>
                <span>-{formatPrice(couponDiscount, locale)}</span>
              </div>
            )}
            {pointsToUse > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>{t('summary.pointDiscount')}</span>
                <span>-{pointsToUse.toLocaleString()}P</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold pt-3 border-t border-[var(--color-border)]">
              <span className="text-[var(--color-text-primary)]">{t('summary.total')}</span>
              <span className="text-[var(--color-brand-primary)]">
                {formatPrice(total, locale)}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
