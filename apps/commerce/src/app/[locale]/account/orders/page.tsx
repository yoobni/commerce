import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { listUserOrders } from '@/lib/queries/orders';
import { Link } from '@/i18n/navigation';
import { formatPrice } from '@/lib/format';
import type { Locale } from '@commerce/types';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'account.orders' });
  return { title: t('title') };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  PAID:      'bg-blue-50 text-blue-700 border-blue-200',
  PREPARING: 'bg-purple-50 text-purple-700 border-purple-200',
  SHIPPED:   'bg-indigo-50 text-indigo-700 border-indigo-200',
  DELIVERED: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-neutral-50 text-neutral-500 border-neutral-200',
  REFUNDED:  'bg-red-50 text-red-600 border-red-200',
};

export default async function OrdersPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? '1', 10));

  const t = await getTranslations({ locale, namespace: 'account.orders' });
  const tEmpty = await getTranslations({ locale, namespace: 'empty' });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const result = await listUserOrders(user.id, { page, per_page: 10 });
  const totalPages = Math.ceil(result.total / 10);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
        {t('title')}
      </h2>

      {result.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-5xl mb-4">📦</p>
          <p className="font-semibold text-[var(--color-text-primary)] mb-1">
            {tEmpty('orders.title')}
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            {tEmpty('orders.description')}
          </p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center h-10 px-5 rounded-lg bg-[var(--color-brand-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {tEmpty('orders.action')}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {result.data.map((order) => {
            const statusKey = order.status.toLowerCase() as keyof typeof STATUS_COLORS;
            const statusLabel = (t(`status.${order.status.toLowerCase()}`) as string) ?? order.status;
            const statusClass = STATUS_COLORS[order.status] ?? 'bg-neutral-50 text-neutral-500 border-neutral-200';

            return (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="block rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 hover:border-[var(--color-brand-primary)]/40 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-xs text-[var(--color-text-tertiary)]">
                      {t('orderNumber')} #{order.order_number}
                    </p>
                    <time
                      dateTime={order.ordered_at}
                      className="text-sm font-medium text-[var(--color-text-primary)]"
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
                <div className="flex items-center justify-between">
                  <p className="text-base font-bold text-[var(--color-text-primary)]">
                    {formatPrice(order.total_amount, locale as Locale)}
                  </p>
                  <span className="text-xs text-[var(--color-text-tertiary)] underline underline-offset-2">
                    {t('viewDetail')} →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          {page > 1 && (
            <Link
              href={`/account/orders?page=${page - 1}`}
              className="h-9 px-4 rounded-lg border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-neutral-50)] transition-colors"
            >
              ←
            </Link>
          )}
          <span className="text-sm text-[var(--color-text-secondary)]">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/account/orders?page=${page + 1}`}
              className="h-9 px-4 rounded-lg border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-neutral-50)] transition-colors"
            >
              →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
