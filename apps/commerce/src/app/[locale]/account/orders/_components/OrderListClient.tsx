'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Locale } from '@/i18n/routing';
import type { OrderListItemDisplay } from '@/lib/orders/queries';
import { EmptyState } from '@/components/ui/EmptyState';

interface Props {
  locale: Locale;
  orders: OrderListItemDisplay[];
}

function formatOrderAmount(amount: number, currency: string): string {
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

function formatOrderDate(isoStr: string, locale: string): string {
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

export function OrderListClient({ locale, orders }: Props) {
  const t = useTranslations('orders');
  const router = useRouter();

  // Build status label map at render time — fully type-safe, no dynamic key access
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

  if (orders.length === 0) {
    return (
      <>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">
          {t('title')}
        </h1>
        <EmptyState
          title={t('noOrders')}
          description={t('noOrdersDesc')}
          action={{
            label: t('browseProducts'),
            onClick: () => router.push(`/${locale}/products`),
          }}
        />
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">
        {t('title')}
      </h1>
      <ul className="space-y-3 list-none p-0 m-0">
        {orders.map((order) => {
          const statusColor = STATUS_COLORS[order.status] ?? 'bg-neutral-300 text-white';
          const statusLabel = statusLabels[order.status] ?? order.status;

          return (
            <li key={order.id}>
              <a
                href={`/${locale}/account/orders/${order.id}`}
                className="block bg-white rounded-xl shadow-sm border border-[var(--color-border)] p-4 hover:shadow-md transition-shadow"
              >
                {/* Header: order number + date + status badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {t('orderNumber')} {order.order_number}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 opacity-70">
                      {formatOrderDate(order.ordered_at, locale)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold shrink-0 ${statusColor}`}
                  >
                    {statusLabel}
                  </span>
                </div>

                {/* Product thumbnail + name + amount */}
                <div className="flex items-center gap-3">
                  {order.first_item_thumbnail ? (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[var(--color-neutral-100)] shrink-0">
                      <Image
                        src={order.first_item_thumbnail}
                        alt={order.first_item_name}
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
                    <p className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-1">
                      {order.first_item_name}
                      {order.item_count > 1 && (
                        <span className="ml-1 text-[var(--color-text-secondary)] font-normal">
                          {t('andMore', { count: order.item_count - 1 })}
                        </span>
                      )}
                    </p>
                    {(order.first_item_color || order.first_item_size) && (
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                        {[order.first_item_color, order.first_item_size]
                          .filter(Boolean)
                          .join(' / ')}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 text-sm font-semibold text-[var(--color-text-primary)]">
                    {formatOrderAmount(order.total_amount, order.currency)}
                  </div>
                </div>

                {/* View detail CTA */}
                <div className="mt-3 flex justify-end">
                  <span className="text-xs font-medium text-[var(--color-primary)]">
                    {t('viewDetail')} →
                  </span>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </>
  );
}
