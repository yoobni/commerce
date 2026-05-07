'use client';

import { useState, useTransition, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/cn';
import type { CartDisplay } from '@/lib/cart/queries';
import type { Address, Locale } from '@commerce/types';
import type { UserCoupon } from '@/lib/coupons/queries';
import { calcCouponDiscount, validateCoupon } from '@/lib/coupons/queries';
import { markCouponIssuanceUsed } from '@/lib/coupons/actions';
import { usePointsAction, earnPointsAction } from '@/lib/points/actions';
import { formatPrice } from '@/lib/format';
import { useTrack } from '@/hooks/useTrack';
import { analytics } from '@/lib/analytics';

type Step = 'shipping' | 'payment' | 'confirm';

interface CheckoutClientProps {
  cart: CartDisplay;
  addresses: Address[];
  locale: Locale;
  pointBalance?: number;
  availableCoupons?: UserCoupon[];
}

const STEP_ORDER: Step[] = ['shipping', 'payment', 'confirm'];

const DELIVERY_NOTES = [
  { ko: '문 앞에 놓아주세요', en: 'Leave at door' },
  { ko: '경비실에 맡겨주세요', en: 'Leave at front desk' },
  { ko: '부재 시 연락주세요', en: 'Call if absent' },
];

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

export function CheckoutClient({
  cart,
  addresses,
  locale,
  pointBalance = 0,
  availableCoupons = [],
}: CheckoutClientProps) {
  const t = useTranslations('checkout');
  const router = useRouter();
  const track = useTrack();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<Step>('shipping');
  const [orderPlaced, setOrderPlaced] = useState(false);

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
  const [couponApplied, setCouponApplied] = useState(false);
  const [activeCoupon, setActiveCoupon] = useState<UserCoupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Point state
  const [pointsInput, setPointsInput] = useState('');
  const [pointsApplied, setPointsApplied] = useState(false);
  const pointsToUse = pointsApplied ? Math.min(parseInt(pointsInput || '0', 10), pointBalance) : 0;

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
  const couponDiscount = activeCoupon ? calcCouponDiscount(activeCoupon, subtotal) : 0;
  const pointsDiscount = Math.min(pointsToUse, pointBalance);
  const total = subtotal + shippingFee - couponDiscount - pointsDiscount;

  useEffect(() => {
    function handleBeforeUnload() {
      if (!orderPlaced) {
        const abandonStep = step === 'confirm' ? 'review' : step;
        track('checkout_abandon', {
          abandon_step: abandonStep as 'shipping' | 'payment' | 'review',
          cart_total: total,
          item_count: cart.items.length,
        });
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [step, orderPlaced, total, cart.items.length, track]);

  function handleAddressSelect(addr: Address) {
    setSelectedAddressId(addr.id);
    setRecipient(addr.recipient_name);
    setPhone(addr.phone);
    setPostalCode(addr.postal_code);
    setAddressLine1(addr.address_line1);
    setAddressLine2(addr.address_line2 ?? '');
  }

  function handleApplyCoupon() {
    const upperCode = couponCode.toUpperCase();
    setCouponError(null);

    const matched = availableCoupons.find((c) => c.code === upperCode);
    if (!matched) {
      setCouponError('invalid');
      track('coupon_apply_fail', { coupon_code: upperCode, fail_reason: 'invalid' });
      return;
    }

    const validation = validateCoupon(matched, subtotal);
    if (!validation.valid) {
      setCouponError(validation.reason ?? 'invalid');
      track('coupon_apply_fail', {
        coupon_code: upperCode,
        fail_reason: validation.reason ?? 'invalid',
      });
      return;
    }

    setCouponApplied(true);
    setActiveCoupon(matched);
    track('coupon_apply', {
      coupon_code: upperCode,
      discount_type: matched.type === 'PERCENTAGE' ? 'percent' : 'fixed',
      discount_value: matched.discount_value,
      order_total_before: subtotal,
    });
  }

  function handleNextStep() {
    const currentIndex = STEP_ORDER.indexOf(step);
    if (currentIndex < STEP_ORDER.length - 1) {
      if (step === 'shipping') {
        track('add_shipping_info', {
          shipping_method: 'standard',
          country: 'KR',
          total_value: total,
        });
      } else if (step === 'payment') {
        track('add_payment_info', {
          payment_method: payMethod,
          total_value: total,
        });
      }
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
      setOrderPlaced(true);
      const demoOrderId = `demo_${Date.now()}`;

      // 쿠폰 사용 처리 — 실결제 연동 후에는 실제 order UUID 전달
      if (activeCoupon) {
        await markCouponIssuanceUsed(activeCoupon.issuance_id);
      }

      // 포인트 차감 (사용량 > 0인 경우)
      if (pointsToUse > 0) {
        await usePointsAction(pointsToUse);
      }

      // 주문 완료 후 포인트 적립 (결제 금액 기준 1%)
      await earnPointsAction(total);

      track('purchase', {
        order_id: demoOrderId,
        transaction_id: null,
        total,
        subtotal,
        shipping_cost: shippingFee,
        tax: 0,
        discount_total: couponDiscount + pointsDiscount,
        coupon_code: couponApplied ? couponCode : null,
        coupon_discount: couponDiscount,
        points_used: pointsToUse,
        points_discount: pointsDiscount,
        item_count: cart.items.reduce((s, i) => s + i.quantity, 0),
        items: cart.items.map((item) => ({
          product_id: item.product_id,
          product_name: getProductName(item, locale),
          price: getItemPrice(item, locale) / item.quantity,
          category: '',
          variant_id: item.product_option_id,
          size: item.size_label,
          image_url: item.product_thumbnail_url,
        })),
        first_purchase: false,
        community_inflow: analytics.getCommunityInflow(),
        shipping_country: 'KR',
        shipping_method: 'standard',
        payment_method: payMethod,
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
      router.push(`/checkout/success?order_id=${demoOrderId}`);
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
                        'w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors',
                        active
                          ? 'bg-[var(--mz-ink)] text-[var(--mz-bg)]'
                          : done
                            ? 'bg-[var(--mz-bg-deep)] text-[var(--mz-ink)]'
                            : 'bg-[var(--mz-bg-deep)] text-[var(--mz-ink-mute)]'
                      )}
                      aria-current={active ? 'step' : undefined}
                    >
                      {done ? '✓' : i + 1}
                    </span>
                    <span
                      className={cn(
                        'text-[13px] font-medium',
                        active
                          ? 'text-[var(--mz-ink)]'
                          : 'text-[var(--mz-ink-mute)]'
                      )}
                    >
                      {stepLabels[s]}
                    </span>
                  </div>
                  {i < STEP_ORDER.length - 1 && (
                    <div
                      className="w-8 md:w-16 h-px bg-[var(--mz-line)] mx-3"
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
              className="font-serif text-[22px] font-[500] leading-[1.2] tracking-[-0.02em] text-[var(--mz-ink)]"
            >
              {t('shipping.title')}
            </h2>

            {/* Saved addresses */}
            {addresses.length > 0 && (
              <div className="space-y-2">
                <p className="text-[12px] font-medium text-[var(--mz-ink-mute)]">
                  {t('shipping.useRegisteredAddress')}
                </p>
                <div className="space-y-2">
                  {addresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => handleAddressSelect(addr)}
                      className={cn(
                        'w-full text-left p-4 rounded-[var(--radius-md)] border transition-colors duration-150',
                        selectedAddressId === addr.id
                          ? 'border-[var(--mz-ink)] bg-[var(--mz-bg-deep)]'
                          : 'border-[var(--mz-line-strong)] hover:border-[var(--mz-ink)]'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {addr.label && (
                          <span className="text-[11px] font-semibold text-[var(--mz-accent)]">
                            {addr.label}
                          </span>
                        )}
                        {addr.is_default && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--mz-bg-deep)] text-[var(--mz-ink-mute)]">
                            {t('shipping.defaultAddress')}
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] font-medium text-[var(--mz-ink)]">
                        {addr.recipient_name} · {addr.phone}
                      </p>
                      <p className="text-[13px] text-[var(--mz-ink-soft)] mt-0.5">
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
                label={t('shipping.postalCode')}
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder={t('shipping.postalCodePlaceholder')}
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
              <label className="text-[13px] font-medium text-[var(--mz-ink)]">
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
                        'px-3 py-1.5 rounded-[var(--radius-pill)] border text-[12px] font-medium transition-colors duration-150',
                        deliveryNote === label
                          ? 'border-[var(--mz-ink)] bg-[var(--mz-ink)] text-[var(--mz-bg)]'
                          : 'border-[var(--mz-line-strong)] text-[var(--mz-ink-soft)] hover:border-[var(--mz-ink)]'
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
                className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border border-[var(--mz-line)] text-[13px] text-[var(--mz-ink)] placeholder:text-[var(--mz-ink-mute)] focus:outline-none focus:border-[var(--mz-ink)] focus:[border-width:1.5px] resize-none transition-[border] duration-150"
              />
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleNextStep}
              disabled={!recipient || !phone || !postalCode || !addressLine1}
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
              className="font-serif text-[22px] font-[500] leading-[1.2] tracking-[-0.02em] text-[var(--mz-ink)]"
            >
              {t('payment.title')}
            </h2>

            {/* Payment methods — domestic */}
            <div>
              <p className="text-eyebrow text-[var(--mz-ink-mute)] mb-3">
                {locale === 'ko' ? '국내 결제' : locale === 'ja' ? '国内決済' : 'Domestic'}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { key: 'card', label: t('payment.creditCard') },
                    { key: 'kakao', label: t('payment.kakaoPay') },
                    { key: 'naver', label: t('payment.naverPay') },
                    { key: 'toss', label: t('payment.tossPay') },
                    { key: 'transfer', label: t('payment.bankTransfer') },
                  ] as { key: PayMethod; label: string }[]
                ).map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPayMethod(key)}
                    className={cn(
                      'py-3.5 px-4 rounded-[var(--radius-md)] border text-[13px] font-medium text-center transition-colors duration-150',
                      payMethod === key
                        ? 'border-[var(--mz-ink)] bg-[var(--mz-bg-deep)] text-[var(--mz-ink)]'
                        : 'border-[var(--mz-line-strong)] text-[var(--mz-ink)] hover:border-[var(--mz-ink)]'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Card input placeholder — activates on payment gateway integration */}
            {payMethod === 'card' && (
              <div className="relative rounded-[var(--radius-md)] border border-[var(--mz-line)] overflow-hidden">
                <div className="absolute inset-0 bg-[var(--mz-bg)] flex items-center justify-center z-10 rounded-[var(--radius-md)]">
                  <p className="text-[12px] text-[var(--mz-ink-mute)] bg-[var(--mz-surface)] px-3 py-1.5 rounded-[var(--radius-pill)] border border-[var(--mz-line-strong)]">
                    {t('payment.cardPending')}
                  </p>
                </div>
                <div
                  className="p-4 space-y-3 opacity-40 pointer-events-none select-none"
                  aria-hidden="true"
                >
                  <div className="h-10 rounded-[var(--radius-md)] border border-[var(--mz-line)] px-3 flex items-center text-[13px] text-[var(--mz-ink-mute)]">
                    {t('payment.cardNumber')} — 0000 0000 0000 0000
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-10 rounded-[var(--radius-md)] border border-[var(--mz-line)] px-3 flex items-center text-[13px] text-[var(--mz-ink-mute)]">
                      {t('payment.expiry')} — MM / YY
                    </div>
                    <div className="h-10 rounded-[var(--radius-md)] border border-[var(--mz-line)] px-3 flex items-center text-[13px] text-[var(--mz-ink-mute)]">
                      {t('payment.cvv')} — CVV
                    </div>
                  </div>
                  <div className="h-10 rounded-[var(--radius-md)] border border-[var(--mz-line)] px-3 flex items-center text-[13px] text-[var(--mz-ink-mute)]">
                    {t('payment.cardHolder')}
                  </div>
                </div>
              </div>
            )}

            {/* International payment frame — non-KO locales */}
            {locale !== 'ko' && (
              <div className="space-y-2">
                <p className="text-eyebrow text-[var(--mz-ink-mute)]">
                  {t('payment.international')}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {['Stripe', 'Klarna'].map((label) => (
                    <button
                      key={label}
                      type="button"
                      disabled
                      className="py-3.5 px-4 rounded-[var(--radius-md)] border border-dashed border-[var(--mz-line-strong)] text-[13px] font-medium text-center cursor-not-allowed"
                    >
                      <span className="text-[var(--mz-ink-mute)]">{label}</span>
                      <span className="block text-[10px] text-[var(--mz-ink-mute)] mt-0.5 opacity-70">
                        Coming soon
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Coupon */}
            <div className="space-y-2">
              <p className="text-[13px] font-medium text-[var(--mz-ink)]">
                {t('coupon.title')}
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder={t('coupon.couponPlaceholder')}
                  disabled={couponApplied}
                  className="flex-1 h-10 px-3 rounded-[var(--radius-md)] border border-[var(--mz-line)] text-[13px] text-[var(--mz-ink)] placeholder:text-[var(--mz-ink-mute)] focus:outline-none focus:border-[var(--mz-ink)] focus:[border-width:1.5px] disabled:bg-[var(--mz-bg-deep)] transition-[border] duration-150"
                />
                {couponApplied ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCouponApplied(false);
                      setCouponCode('');
                      setActiveCoupon(null);
                      setCouponError(null);
                    }}
                  >
                    {t('coupon.remove')}
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleApplyCoupon}
                    disabled={!couponCode}
                  >
                    {t('coupon.apply')}
                  </Button>
                )}
              </div>
              {couponApplied && activeCoupon && (
                <p className="text-[12px] text-[var(--color-success)] font-medium">
                  {t('coupon.applied')} —{' '}
                  {activeCoupon.type === 'PERCENTAGE'
                    ? `${activeCoupon.discount_value}%`
                    : formatPrice(activeCoupon.discount_value, locale)}{' '}
                  {t('coupon.discount', { defaultValue: '할인' })}
                </p>
              )}
              {couponError && (
                <p className="text-[12px] text-red-500 font-medium">
                  {couponError === 'expired'
                    ? '만료된 쿠폰입니다.'
                    : couponError === 'min_order'
                      ? `최소 주문금액 ${activeCoupon?.min_order_amount ? formatPrice(activeCoupon.min_order_amount, locale) : ''} 이상 필요합니다.`
                      : '유효하지 않은 쿠폰 코드입니다.'}
                </p>
              )}
            </div>

            {/* Points */}
            {pointBalance > 0 && (
              <div className="space-y-2">
                <p className="text-[13px] font-medium text-[var(--mz-ink)]">
                  {t('coupon.points')}
                </p>
                <p className="text-[12px] text-[var(--mz-ink-mute)]">
                  {t('coupon.availablePoints')}: <span className="font-semibold text-[var(--mz-ink)]">{pointBalance.toLocaleString()}P</span>
                </p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    max={pointBalance}
                    value={pointsInput}
                    onChange={(e) => {
                      setPointsInput(e.target.value);
                      setPointsApplied(false);
                    }}
                    disabled={pointsApplied}
                    placeholder="0"
                    className="flex-1 h-10 px-3 rounded-[var(--radius-md)] border border-[var(--mz-line)] text-[13px] text-[var(--mz-ink)] placeholder:text-[var(--mz-ink-mute)] focus:outline-none focus:border-[var(--mz-ink)] focus:[border-width:1.5px] disabled:bg-[var(--mz-bg-deep)] transition-[border] duration-150"
                  />
                  {pointsApplied ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPointsApplied(false);
                        setPointsInput('');
                      }}
                    >
                      {t('coupon.remove')}
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPointsInput(String(pointBalance));
                          setPointsApplied(true);
                        }}
                      >
                        {t('coupon.useAll')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const val = parseInt(pointsInput || '0', 10);
                          if (val > 0 && val <= pointBalance) setPointsApplied(true);
                        }}
                        disabled={!pointsInput || parseInt(pointsInput, 10) <= 0}
                      >
                        {t('coupon.apply')}
                      </Button>
                    </>
                  )}
                </div>
                {pointsApplied && pointsToUse > 0 && (
                  <p className="text-[12px] text-[var(--color-success)] font-medium">
                    {t('coupon.applied')} — {pointsToUse.toLocaleString()}P {t('summary.pointDiscount', { defaultValue: '포인트 할인' })}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="ghost" size="lg" className="flex-1" onClick={handlePrevStep}>
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
              className="font-serif text-[22px] font-[500] leading-[1.2] tracking-[-0.02em] text-[var(--mz-ink)]"
            >
              {t('steps.confirm')}
            </h2>

            {/* Shipping summary */}
            <div className="rounded-[var(--radius-md)] border border-[var(--mz-line)] p-4 space-y-2">
              <p className="text-eyebrow text-[var(--mz-ink-mute)]">
                {t('shipping.title')}
              </p>
              <p className="text-[13px] text-[var(--mz-ink)] font-medium">
                {recipient} · {phone}
              </p>
              <p className="text-[13px] text-[var(--mz-ink-soft)]">
                {postalCode} {addressLine1} {addressLine2}
              </p>
              {deliveryNote && (
                <p className="text-[12px] text-[var(--mz-ink-mute)] italic">{deliveryNote}</p>
              )}
            </div>

            {/* Payment summary */}
            <div className="rounded-[var(--radius-md)] border border-[var(--mz-line)] p-4 space-y-2">
              <p className="text-eyebrow text-[var(--mz-ink-mute)]">
                {t('payment.title')}
              </p>
              <p className="text-[13px] text-[var(--mz-ink)] font-medium">
                {payMethod === 'card' && t('payment.creditCard')}
                {payMethod === 'kakao' && t('payment.kakaoPay')}
                {payMethod === 'naver' && t('payment.naverPay')}
                {payMethod === 'toss' && t('payment.tossPay')}
                {payMethod === 'transfer' && t('payment.bankTransfer')}
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" size="lg" className="flex-1" onClick={handlePrevStep}>
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
        <div className="rounded-[var(--radius-lg)] border border-[var(--mz-line)] bg-[var(--mz-surface)] p-5">
          <h2 className="font-serif text-[18px] font-[500] leading-[1.2] tracking-[-0.02em] text-[var(--mz-ink)] mb-4">
            {t('summary.title')}
          </h2>

          {/* Items */}
          <ul className="space-y-3 mb-5" aria-label="Cart items">
            {cart.items.map((item) => (
              <li key={item.id} className="flex gap-3">
                <div className="relative w-14 h-14 rounded-[var(--radius-md)] overflow-hidden bg-[var(--mz-bg-deep)] shrink-0">
                  <Image
                    src={item.product_thumbnail_url}
                    alt={getProductName(item, locale)}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--mz-ink)] text-[var(--mz-bg)] text-[10px] font-bold flex items-center justify-center">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-[500] font-serif text-[var(--mz-ink)] truncate">
                    {getProductName(item, locale)}
                  </p>
                  <p className="text-[11px] text-[var(--mz-ink-mute)]">
                    {item.color} / {item.size_label}
                  </p>
                  <p className="text-[13px] font-[600] font-serif text-[var(--mz-ink)] mt-0.5">
                    {formatPrice(getItemPrice(item, locale), locale)}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* Price breakdown */}
          <div className="space-y-2 border-t border-[var(--mz-line)] pt-4">
            <div className="flex justify-between">
              <span className="text-[13px] text-[var(--mz-ink-soft)]">{t('summary.subtotal')}</span>
              <span className="text-[13px] text-[var(--mz-ink)]">
                {formatPrice(subtotal, locale)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[13px] text-[var(--mz-ink-soft)]">{t('summary.shippingFee')}</span>
              <span className="text-[13px] text-[var(--mz-ink)]">
                {shippingFee === 0 ? t('summary.freeShipping') : formatPrice(shippingFee, locale)}
              </span>
            </div>
            {couponApplied && (
              <div className="flex justify-between">
                <span className="text-[13px] text-[var(--color-success)]">{t('summary.couponDiscount')}</span>
                <span className="text-[13px] text-[var(--color-success)]">-{formatPrice(couponDiscount, locale)}</span>
              </div>
            )}
            {pointsToUse > 0 && (
              <div className="flex justify-between">
                <span className="text-[13px] text-[var(--color-success)]">{t('summary.pointDiscount', { defaultValue: '포인트 할인' })}</span>
                <span className="text-[13px] text-[var(--color-success)]">-{pointsToUse.toLocaleString()}P</span>
              </div>
            )}
            <div className="flex justify-between items-end pt-3 border-t border-[var(--mz-line)]">
              <span className="text-[13px] font-medium text-[var(--mz-ink)]">{t('summary.total')}</span>
              <span className="font-serif text-[22px] font-[600] leading-[26px] text-[var(--mz-ink)]">
                {formatPrice(total, locale)}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
