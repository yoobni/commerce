import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { routing } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { getOrderById } from '@/lib/queries/orders';
import { Link } from '@/i18n/navigation';
import { formatPrice } from '@/lib/format';
import { ShipmentTracker } from '@/components/ui/ShipmentTracker';
import type { Locale } from '@commerce/types';

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'account.orders' });
  return { title: t('title') };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  PAID: 'bg-blue-50 text-blue-700 border-blue-200',
  PREPARING: 'bg-purple-50 text-purple-700 border-purple-200',
  SHIPPED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  DELIVERED: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-neutral-50 text-neutral-500 border-neutral-200',
  REFUNDED: 'bg-red-50 text-red-600 border-red-200',
};

export default async function OrderDetailPage({ params }: Props) {
  const { locale, id } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale, namespace: 'account.orders' });
  const tCheckout = await getTranslations({ locale, namespace: 'checkout' });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const order = await getOrderById(id, user.id);
  if (!order) notFound();

  const statusLabel = (t(`status.${order.status.toLowerCase()}`) as string) ?? order.status;
  const statusClass =
    STATUS_COLORS[order.status] ?? 'bg-neutral-50 text-neutral-500 border-neutral-200';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/account/orders"
          className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
          aria-label="Back to orders"
        >
          ← {t('title')}
        </Link>
      </div>

      {/* Order header */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-[var(--color-text-tertiary)] mb-1">
              {t('orderNumber')} #{order.order_number}
            </p>
            <time
              dateTime={order.ordered_at}
              className="text-sm text-[var(--color-text-secondary)]"
            >
              {new Date(order.ordered_at).toLocaleDateString(locale === 'ko' ? 'ko-KR' : locale)}
            </time>
          </div>
          <span
            className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${statusClass}`}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Order items */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">상품 목록</h3>
        <ul className="space-y-4" aria-label="Order items">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-4">
              <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-[var(--color-neutral-100)] shrink-0">
                <Image
                  src={item.product_snapshot.thumbnail_url}
                  alt={item.product_snapshot.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                  {item.product_snapshot.name}
                </p>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                  {item.product_snapshot.color} / {item.product_snapshot.size}
                  {' · '}수량 {item.quantity}
                </p>
                <p className="text-sm font-semibold text-[var(--color-text-primary)] mt-1">
                  {formatPrice(item.total_price, locale as Locale)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Shipping address */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-2">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
          {tCheckout('shipping.title')}
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {order.shipping_address_snapshot.recipient_name} · {order.shipping_address_snapshot.phone}
        </p>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {order.shipping_address_snapshot.address_line1}
          {order.shipping_address_snapshot.address_line2 &&
            ` ${order.shipping_address_snapshot.address_line2}`}
        </p>
      </div>

      {/* Price summary */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-3">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
          {tCheckout('summary.title')}
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-secondary)]">
              {tCheckout('summary.subtotal')}
            </span>
            <span>{formatPrice(order.subtotal, locale as Locale)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-secondary)]">
              {tCheckout('summary.shippingFee')}
            </span>
            <span>
              {order.shipping_fee === 0
                ? tCheckout('summary.freeShipping')
                : formatPrice(order.shipping_fee, locale as Locale)}
            </span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>{tCheckout('summary.discount')}</span>
              <span>-{formatPrice(order.discount_amount, locale as Locale)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base pt-2 border-t border-[var(--color-border)]">
            <span>{tCheckout('summary.total')}</span>
            <span className="text-[var(--color-brand-primary)]">
              {formatPrice(order.total_amount, locale as Locale)}
            </span>
          </div>
        </div>
      </div>

      {/* Shipment tracking frame */}
      {['PREPARING', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(
        order.status
      ) && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-3">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            {t('shipmentStatus')}
          </h3>
          <ShipmentTracker
            orderStatus={order.status}
            carrier={null}
            trackingNumber={null}
            locale={locale as Locale}
          />
        </div>
      )}
    </div>
  );
}
