'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Locale } from '@/i18n/routing';
import type { OrderDetailDisplay } from '@/lib/orders/queries';

interface Props {
  locale: Locale;
  order: OrderDetailDisplay;
}

function formatAmount(amount: number, currency: string): string {
  const localeMap: Record<string, string> = {
    KRW: 'ko-KR',
    USD: 'en-US',
    JPY: 'ja-JP',
    EUR: 'de-DE',
  };
  const localeStr = localeMap[currency] ?? 'en-US';
  return new Intl.NumberFormat(localeStr, {
    style: 'currency',
    currency,
    minimumFractionDigits: ['KRW', 'JPY'].includes(currency) ? 0 : 2,
    maximumFractionDigits: ['KRW', 'JPY'].includes(currency) ? 0 : 2,
  }).format(amount);
}

function formatDate(isoStr: string | null, locale: string): string {
  if (!isoStr) return '—';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(isoStr));
}

const STATUS_COLORS: Record<string, string> = {
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

export function OrderDetailClient({ locale, order }: Props) {
  const t = useTranslations('orders');
  const router = useRouter();

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

  const statusColor = STATUS_COLORS[order.status] ?? 'bg-neutral-300 text-white';
  const statusLabel = statusLabels[order.status] ?? order.status;

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => router.push(`/${locale}/account/orders`)}
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] mb-6 hover:text-[var(--color-text-primary)] transition-colors"
      >
        ← {t('backToOrders')}
      </button>

      {/* Order header */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-5 mb-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {t('orderNumber')} {order.order_number}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 opacity-70">
              {t('orderedAt')} {formatDate(order.ordered_at, locale)}
            </p>
          </div>
          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold shrink-0 ${statusColor}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Order items */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-5 mb-4">
        <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
          {t('detail.products')}
        </p>
        <ul className="space-y-4 list-none p-0 m-0">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-start gap-3">
              {item.snapshot_thumbnail_url ? (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[var(--color-neutral-100)] shrink-0">
                  <Image
                    src={item.snapshot_thumbnail_url}
                    alt={item.snapshot_name}
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg bg-[var(--color-neutral-100)] shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-2">
                  {item.snapshot_name}
                </p>
                {(item.snapshot_color || item.snapshot_size) && (
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                    {[item.snapshot_color, item.snapshot_size].filter(Boolean).join(' / ')}
                  </p>
                )}
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  {t('detail.quantity')} {item.quantity} · {t('detail.unitPrice')}{' '}
                  {formatAmount(item.unit_price, order.currency)}
                </p>
              </div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)] shrink-0">
                {formatAmount(item.total_price, order.currency)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Payment summary */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-5 mb-4">
        <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
          {t('detail.summary')}
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary)]">{t('detail.subtotal')}</span>
            <span>{formatAmount(order.subtotal, order.currency)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary)]">{t('detail.shippingFee')}</span>
            <span>
              {order.shipping_fee === 0
                ? t('free')
                : formatAmount(order.shipping_fee, order.currency)}
            </span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-red-600">
              <span>{t('detail.discount')}</span>
              <span>-{formatAmount(order.discount_amount, order.currency)}</span>
            </div>
          )}
          {order.point_used > 0 && (
            <div className="flex justify-between text-[var(--color-text-secondary)]">
              <span>{t('detail.points')}</span>
              <span>-{formatAmount(order.point_used, order.currency)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold pt-2 border-t border-[var(--color-border-subtle)]">
            <span>{t('detail.total')}</span>
            <span>{formatAmount(order.total_amount, order.currency)}</span>
          </div>
        </div>
        {order.payment_method && (
          <p className="text-xs text-[var(--color-text-secondary)] mt-3">
            {t('detail.payment')}:{' '}
            {paymentMethodLabels[order.payment_method] ?? order.payment_method}
          </p>
        )}
      </div>

      {/* Shipping address */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-5 mb-4">
        <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
          {t('detail.shippingAddress')}
        </p>
        <div className="text-sm space-y-1 text-[var(--color-text-secondary)]">
          <p>
            <span className="font-medium text-[var(--color-text-primary)]">
              {order.recipient_name}
            </span>
          </p>
          {order.phone && <p>{order.phone}</p>}
          <p>
            {[order.address_line1, order.address_line2].filter(Boolean).join(' ')}
          </p>
          <p>
            {[order.city, order.state_province, order.postal_code, order.shipping_country]
              .filter(Boolean)
              .join(', ')}
          </p>
        </div>
      </div>

      {/* Shipment tracking */}
      {order.shipment_carrier && (
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
          <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
            {t('detail.trackingNumber')}
          </p>
          <div className="text-sm space-y-1 text-[var(--color-text-secondary)]">
            <p>
              {t('detail.carrier')}: {order.shipment_carrier}
            </p>
            {order.shipment_tracking_number && (
              <p>
                {t('detail.trackingNumber')}: {order.shipment_tracking_number}
              </p>
            )}
            {order.shipment_shipped_at && (
              <p>
                {t('detail.shippedAt')}: {formatDate(order.shipment_shipped_at, locale)}
              </p>
            )}
            {order.shipment_estimated_delivery_at && (
              <p>
                {t('detail.estimatedDelivery')}:{' '}
                {formatDate(order.shipment_estimated_delivery_at, locale)}
              </p>
            )}
            {order.shipment_delivered_at && (
              <p>
                {t('detail.deliveredAt')}: {formatDate(order.shipment_delivered_at, locale)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
