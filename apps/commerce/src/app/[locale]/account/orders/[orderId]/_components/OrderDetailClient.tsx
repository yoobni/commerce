'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import type { Locale } from '@/i18n/routing';
import type { OrderDetailDisplay } from '@/lib/orders/queries';
import { analytics } from '@/lib/analytics';

const REVIEWABLE_STATUSES = new Set(['DELIVERED', 'CONFIRMED']);

interface Props {
  locale: Locale;
  order: OrderDetailDisplay;
}

const MAIN_FLOW = [
  'PENDING_PAYMENT',
  'PAID',
  'PREPARING',
  'SHIPPED',
  'DELIVERED',
  'CONFIRMED',
] as const;

const TERMINAL_STATUSES = new Set([
  'CANCELLED',
  'DELIVERY_FAILED',
  'RETURN_REQUESTED',
  'RETURNED',
  'REFUND_REQUESTED',
  'REFUNDED',
]);

const STATUS_BADGE_COLORS: Record<string, string> = {
  PENDING_PAYMENT: 'bg-amber-500 text-white',
  PAID: 'bg-emerald-500 text-white',
  PREPARING: 'bg-blue-400 text-white',
  SHIPPED: 'bg-blue-600 text-white',
  DELIVERED: 'bg-emerald-600 text-white',
  CONFIRMED: 'bg-neutral-600 text-white',
  RETURN_REQUESTED: 'bg-orange-500 text-white',
  RETURNED: 'bg-neutral-400 text-white',
  REFUND_REQUESTED: 'bg-orange-600 text-white',
  REFUNDED: 'bg-neutral-400 text-white',
  CANCELLED: 'bg-red-500 text-white',
  DELIVERY_FAILED: 'bg-red-500 text-white',
};

function formatAmount(amount: number, currency: string): string {
  const localeMap: Record<string, string> = {
    KRW: 'ko-KR',
    USD: 'en-US',
    JPY: 'ja-JP',
    EUR: 'de-DE',
  };
  return new Intl.NumberFormat(localeMap[currency] ?? 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: ['KRW', 'JPY'].includes(currency) ? 0 : 2,
    maximumFractionDigits: ['KRW', 'JPY'].includes(currency) ? 0 : 2,
  }).format(amount);
}

function formatDate(isoStr: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(isoStr));
}

export function OrderDetailClient({ locale, order }: Props) {
  const t = useTranslations('orders');
  const tReview = useTranslations('review');

  useEffect(() => {
    analytics.track('order_detail_view', {
      order_id: order.id,
      order_status: order.status,
    });
  }, [order.id, order.status]);

  const statusLabels: Record<string, string> = {
    PENDING_PAYMENT: t('status.PENDING_PAYMENT'),
    PAID: t('status.PAID'),
    PREPARING: t('status.PREPARING'),
    SHIPPED: t('status.SHIPPED'),
    DELIVERED: t('status.DELIVERED'),
    CONFIRMED: t('status.CONFIRMED'),
    RETURN_REQUESTED: t('status.RETURN_REQUESTED'),
    RETURNED: t('status.RETURNED'),
    REFUND_REQUESTED: t('status.REFUND_REQUESTED'),
    REFUNDED: t('status.REFUNDED'),
    CANCELLED: t('status.CANCELLED'),
    DELIVERY_FAILED: t('status.DELIVERY_FAILED'),
  };

  const paymentMethodLabels: Record<string, string> = {
    CARD: t('paymentMethod.CARD'),
    KAKAO_PAY: t('paymentMethod.KAKAO_PAY'),
    NAVER_PAY: t('paymentMethod.NAVER_PAY'),
    TOSS_PAY: t('paymentMethod.TOSS_PAY'),
    STRIPE: t('paymentMethod.STRIPE'),
    KLARNA: t('paymentMethod.KLARNA'),
  };

  const isTerminal = TERMINAL_STATUSES.has(order.status);
  const currentStepIdx = isTerminal
    ? -1
    : MAIN_FLOW.indexOf(order.status as (typeof MAIN_FLOW)[number]);

  const badgeColor = STATUS_BADGE_COLORS[order.status] ?? 'bg-neutral-300 text-white';

  return (
    <div className="space-y-5">
      {/* Back */}
      <Link
        href={`/${locale}/account/orders`}
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
      >
        ← {t('backToOrders')}
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            {t('detail.title')}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {t('orderNumber')} {order.order_number}
            {' · '}
            {formatDate(order.ordered_at, locale)}
          </p>
        </div>
        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${badgeColor}`}>
          {statusLabels[order.status] ?? order.status}
        </span>
      </div>

      {/* Timeline */}
      <section className="bg-white rounded-xl p-5 shadow-sm border border-[var(--color-border)]">
        <h2 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-5">
          {t('detail.timeline')}
        </h2>
        {isTerminal ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <svg
                className="w-4 h-4 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span className="text-sm font-medium text-red-600">
              {statusLabels[order.status] ?? order.status}
            </span>
          </div>
        ) : (
          <div className="flex items-start">
            {MAIN_FLOW.map((step, idx) => {
              const isDone = currentStepIdx >= 0 && idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div key={step} className="flex-1 flex flex-col items-center relative min-w-0">
                  {/* Left connector */}
                  {idx > 0 && (
                    <div
                      className={`absolute top-3.5 -translate-y-1/2 right-1/2 left-0 h-0.5 ${
                        idx <= currentStepIdx
                          ? 'bg-[var(--color-primary)]'
                          : 'bg-[var(--color-neutral-200)]'
                      }`}
                    />
                  )}
                  {/* Right connector */}
                  {idx < MAIN_FLOW.length - 1 && (
                    <div
                      className={`absolute top-3.5 -translate-y-1/2 left-1/2 right-0 h-0.5 ${
                        isDone
                          ? 'bg-[var(--color-primary)]'
                          : 'bg-[var(--color-neutral-200)]'
                      }`}
                    />
                  )}
                  {/* Circle */}
                  <div
                    className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs border-2 transition-all ${
                      isDone
                        ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                        : isCurrent
                        ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white ring-4 ring-[var(--color-primary)]/20'
                        : 'bg-white border-[var(--color-neutral-200)] text-[var(--color-neutral-400)]'
                    }`}
                  >
                    {isDone ? (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  {/* Label */}
                  <span
                    className={`mt-2 text-[10px] text-center leading-tight px-0.5 ${
                      isCurrent
                        ? 'text-[var(--color-primary)] font-semibold'
                        : isDone
                        ? 'text-[var(--color-text-secondary)]'
                        : 'text-[var(--color-neutral-400)]'
                    }`}
                  >
                    {statusLabels[step]}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Items */}
      <section className="bg-white rounded-xl p-5 shadow-sm border border-[var(--color-border)]">
        <h2 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-4">
          {t('detail.products')}
        </h2>
        <ul className="divide-y divide-[var(--color-border)] list-none p-0 m-0">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
              {item.snapshot_thumbnail_url ? (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-[var(--color-neutral-100)] shrink-0">
                  <Image
                    src={item.snapshot_thumbnail_url}
                    alt={item.snapshot_name}
                    fill
                    className="object-cover"
                    sizes="80px"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-lg bg-[var(--color-neutral-100)] shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text-primary)] leading-snug">
                  {item.snapshot_name}
                </p>
                {(item.snapshot_color || item.snapshot_size) && (
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                    {[item.snapshot_color, item.snapshot_size].filter(Boolean).join(' / ')}
                  </p>
                )}
                {item.snapshot_sku && (
                  <p className="text-[10px] text-[var(--color-neutral-400)] mt-0.5 font-mono">
                    {item.snapshot_sku}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2 gap-2">
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {t('detail.quantity')} {item.quantity}
                    <span className="mx-1">·</span>
                    {t('detail.unitPrice')} {formatAmount(item.unit_price, order.currency)}
                  </p>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)] shrink-0">
                    {formatAmount(item.total_price, order.currency)}
                  </p>
                </div>
                {REVIEWABLE_STATUSES.has(item.status) && item.snapshot_product_id && (
                  <div className="mt-2">
                    <Link
                      href={`/${locale}/account/reviews/write?orderItemId=${encodeURIComponent(item.id)}&productId=${encodeURIComponent(item.snapshot_product_id)}&productName=${encodeURIComponent(item.snapshot_name)}&productThumbnail=${encodeURIComponent(item.snapshot_thumbnail_url)}&purchasedSize=${encodeURIComponent(item.snapshot_size)}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] border border-[var(--color-primary)]/30 rounded-lg px-2.5 py-1 hover:bg-[var(--color-primary)]/5 transition-colors"
                    >
                      {tReview('writeReview')}
                    </Link>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Payment Summary */}
      <section className="bg-white rounded-xl p-5 shadow-sm border border-[var(--color-border)]">
        <h2 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-4">
          {t('detail.summary')}
        </h2>
        <dl className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-[var(--color-text-secondary)]">{t('detail.subtotal')}</dt>
            <dd className="font-medium text-[var(--color-text-primary)]">
              {formatAmount(order.subtotal, order.currency)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--color-text-secondary)]">{t('detail.shippingFee')}</dt>
            <dd className="font-medium text-[var(--color-text-primary)]">
              {order.shipping_fee === 0
                ? t('free')
                : formatAmount(order.shipping_fee, order.currency)}
            </dd>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-secondary)]">{t('detail.discount')}</dt>
              <dd className="font-medium text-red-600">
                -{formatAmount(order.discount_amount, order.currency)}
              </dd>
            </div>
          )}
          {order.point_used > 0 && (
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-secondary)]">{t('detail.points')}</dt>
              <dd className="font-medium text-red-600">
                -{formatAmount(order.point_used, order.currency)}
              </dd>
            </div>
          )}
          <div className="pt-2.5 border-t border-[var(--color-border)] flex justify-between">
            <dt className="font-semibold text-[var(--color-text-primary)]">{t('detail.total')}</dt>
            <dd className="font-bold text-[var(--color-text-primary)] text-base">
              {formatAmount(order.total_amount, order.currency)}
            </dd>
          </div>
        </dl>
        {order.payment_method && (
          <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center justify-between text-sm">
            <span className="text-[var(--color-text-secondary)]">{t('detail.payment')}</span>
            <span className="font-medium text-[var(--color-text-primary)]">
              {paymentMethodLabels[order.payment_method] ?? order.payment_method}
            </span>
          </div>
        )}
      </section>

      {/* Shipping Address */}
      <section className="bg-white rounded-xl p-5 shadow-sm border border-[var(--color-border)]">
        <h2 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-4">
          {t('detail.shippingAddress')}
        </h2>
        <dl className="space-y-2 text-sm">
          <div className="flex gap-3">
            <dt className="text-[var(--color-text-secondary)] shrink-0 w-16">
              {t('detail.recipient')}
            </dt>
            <dd className="font-medium text-[var(--color-text-primary)]">
              {order.recipient_name}
            </dd>
          </div>
          <div className="flex gap-3">
            <dt className="text-[var(--color-text-secondary)] shrink-0 w-16">
              {t('detail.phone')}
            </dt>
            <dd className="text-[var(--color-text-primary)]">{order.phone}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="text-[var(--color-text-secondary)] shrink-0 w-16">
              {t('detail.address')}
            </dt>
            <dd className="text-[var(--color-text-primary)]">
              {[
                order.address_line1,
                order.address_line2,
                order.city,
                order.state_province,
                order.postal_code,
                order.shipping_country,
              ]
                .filter(Boolean)
                .join(', ')}
            </dd>
          </div>
        </dl>
      </section>

      {/* Shipment Tracking */}
      {order.shipment_tracking_number && (
        <section className="bg-white rounded-xl p-5 shadow-sm border border-[var(--color-border)]">
          <h2 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-4">
            {t('detail.trackingNumber')}
          </h2>
          <dl className="space-y-2.5 text-sm">
            {order.shipment_carrier && (
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-secondary)]">{t('detail.carrier')}</dt>
                <dd className="font-medium text-[var(--color-text-primary)]">
                  {order.shipment_carrier}
                </dd>
              </div>
            )}
            <div className="flex justify-between items-center gap-3">
              <dt className="text-[var(--color-text-secondary)] shrink-0">
                {t('detail.trackingNumber')}
              </dt>
              <dd className="font-mono text-sm font-medium text-[var(--color-text-primary)] text-right break-all">
                {order.shipment_tracking_number}
              </dd>
            </div>
            {order.shipment_shipped_at && (
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-secondary)]">{t('detail.shippedAt')}</dt>
                <dd className="text-[var(--color-text-primary)]">
                  {formatDate(order.shipment_shipped_at, locale)}
                </dd>
              </div>
            )}
            {order.shipment_estimated_delivery_at && (
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-secondary)]">
                  {t('detail.estimatedDelivery')}
                </dt>
                <dd className="text-[var(--color-text-primary)]">
                  {formatDate(order.shipment_estimated_delivery_at, locale)}
                </dd>
              </div>
            )}
            {order.shipment_delivered_at && (
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-secondary)]">{t('detail.deliveredAt')}</dt>
                <dd className="text-[var(--color-text-primary)]">
                  {formatDate(order.shipment_delivered_at, locale)}
                </dd>
              </div>
            )}
          </dl>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(order.shipment_tracking_number ?? '');
            }}
            className="mt-4 w-full py-2.5 rounded-lg border border-[var(--color-primary)] text-[var(--color-primary)] text-sm font-medium hover:bg-[var(--color-primary)]/5 active:bg-[var(--color-primary)]/10 transition-colors"
          >
            {t('detail.trackPackage')}
          </button>
        </section>
      )}
    </div>
  );
}
