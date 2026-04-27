'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/cn';
import type { CartDisplay } from '@/lib/cart/queries';
import type { Address, Locale } from '@commerce/types';
import { formatPrice } from '@/lib/format';
import { useTrack } from '@/hooks/useTrack';

type Step = 'shipping' | 'payment' | 'confirm';

interface CheckoutClientProps {
  cart: CartDisplay;
  addresses: Address[];
  locale: Locale;
}

const STEP_ORDER: Step[] = ['shipping', 'payment', 'confirm'];

const DELIVERY_NOTES = [
  { ko: '문 앞에 놓아주세요', en: 'Leave at door' },
  { ko: '경비실에 맡겨주세요', en: 'Leave at front desk' },
  { ko: '부재 시 연락주세요', en: 'Call if absent' },
];

function getProductName(
  item: CartDisplay['items'][number],
  locale: Locale
): string {
  if (locale === 'ko') return item.product_name_ko;
  if (locale === 'ja') return item.product_name_ja;
  if (locale === 'de') return item.product_name_de;
  return item.product_name_en;
}

function getItemPrice(item: CartDisplay['items'][number], locale: Locale): number {
  const base =
    locale === 'ko' ? item.product_base_price_krw
    : locale === 'ja' ? item.product_base_price_jpy
    : locale === 'de' ? item.product_base_price_eur
    : item.product_base_price_usd;
  const extra =
    locale === 'ko' ? item.additional_price_krw
    : locale === 'ja' ? item.additional_price_jpy
    : locale === 'de' ? item.additional_price_eur
    : item.additional_price_usd;
  return (base + extra) * item.quantity;
}

export function CheckoutClient({ cart, addresses, locale }: CheckoutClientProps) {
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
  type PayMethod = 'card' | 'kakao' | 'naver' | 'transfer';
  const [payMethod, setPayMethod] = useState<PayMethod>('card');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  const subtotal = cart.items.reduce((sum, item) => sum + getItemPrice(item, locale), 0);
  const shippingFee = subtotal >= (locale === 'ko' ? 50000 : locale === 'en' ? 50 : locale === 'ja' ? 7000 : 50) ? 0 : (locale === 'ko' ? 3000 : locale === 'en' ? 10 : locale === 'ja' ? 1000 : 8);
  const couponDiscount = couponApplied ? Math.floor(subtotal * 0.1) : 0;
  const total = subtotal + shippingFee - couponDiscount;

  function handleAddressSelect(addr: Address) {
    setSelectedAddressId(addr.id);
    setRecipient(addr.recipient_name);
    setPhone(addr.phone);
    setPostalCode(addr.postal_code);
    setAddressLine1(addr.address_line1);
    setAddressLine2(addr.address_line2 ?? '');
  }

  function handleApplyCoupon() {
    if (couponCode.toUpperCase() === 'RAVI10') {
      setCouponApplied(true);
    }
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
        point_used: 0,
      });

      // ─── Stripe 국제결제 연동 예시 (활성화 전 주석 처리) ──────────────────────
      // 패키지: npm i @stripe/stripe-js @stripe/react-stripe-js
      // 환경변수: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY
      //
      // 1) PaymentIntent 생성 (서버)
      //    POST /api/payments/create-intent → { clientSecret }
      //
      // 2) Stripe Elements로 결제 진행 (클라이언트)
      //    import { loadStripe } from '@stripe/stripe-js';
      //    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      //    const res = await fetch('/api/payments/create-intent', {
      //      method: 'POST',
      //      headers: { 'Content-Type': 'application/json' },
      //      body: JSON.stringify({
      //        amount: total,
      //        currency: locale === 'ko' ? 'krw' : locale === 'ja' ? 'jpy' : locale === 'de' ? 'eur' : 'usd',
      //        metadata: { cart_id: cart.id, coupon_code: couponApplied ? couponCode : '' },
      //      }),
      //    });
      //    const { clientSecret, paymentIntentId } = await res.json();
      //
      // 3) 결제 확인
      //    const { error, paymentIntent } = await stripe!.confirmCardPayment(clientSecret, {
      //      payment_method: { card: cardElement },
      //    });
      //    if (error) { /* 실패 처리 */ return; }
      //
      // 4) 주문 생성 → 성공 페이지
      //    const order = await createOrder({ cartId: cart.id, paymentIntentId });
      //    router.push(`/checkout/success?order_id=${order.id}`);
      // ─────────────────────────────────────────────────────────────────────────

      // 데모: 실제 결제 연동 전 임시 라우팅
      router.push('/checkout/success?order_id=demo');
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
                        active ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)]'
                      )}
                    >
                      {stepLabels[s]}
                    </span>
                  </div>
                  {i < STEP_ORDER.length - 1 && (
                    <div className="w-8 md:w-16 h-px bg-[var(--color-border)] mx-3" aria-hidden="true" />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Step: Shipping */}
        {step === 'shipping' && (
          <section aria-labelledby="shipping-heading" className="space-y-5">
            <h2 id="shipping-heading" className="text-lg font-semibold text-[var(--color-text-primary)]">
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
            <h2 id="payment-heading" className="text-lg font-semibold text-[var(--color-text-primary)]">
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
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder={t('coupon.couponPlaceholder')}
                  disabled={couponApplied}
                  className="flex-1 h-10 px-3 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 disabled:bg-[var(--color-neutral-50)] transition"
                />
                {couponApplied ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => { setCouponApplied(false); setCouponCode(''); }}
                  >
                    {t('coupon.remove')}
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleApplyCoupon}
                    disabled={!couponCode}
                  >
                    {t('coupon.apply')}
                  </Button>
                )}
              </div>
              {couponApplied && (
                <p className="text-xs text-green-600 font-medium">
                  {t('coupon.applied')} — 10% {t('coupon.discount', { defaultValue: '할인' })}
                </p>
              )}
            </div>

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
            <h2 id="confirm-heading" className="text-lg font-semibold text-[var(--color-text-primary)]">
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
            </div>

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
      <aside aria-label={t('summary.title')} className="space-y-4 lg:sticky lg:top-24 lg:self-start">
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
              <span className="text-[var(--color-text-secondary)]">
                {t('summary.subtotal')}
              </span>
              <span className="text-[var(--color-text-primary)]">
                {formatPrice(subtotal, locale)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">
                {t('summary.shippingFee')}
              </span>
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
            <div className="flex justify-between text-base font-bold pt-3 border-t border-[var(--color-border)]">
              <span className="text-[var(--color-text-primary)]">
                {t('summary.total')}
              </span>
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
