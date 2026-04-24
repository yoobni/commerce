import Link from 'next/link';
import type { OrderStatus } from '@commerce/types';
import {
  adminListOrders,
  ORDER_STATUS_LABEL,
  type OrderStatusFilter,
} from '@/lib/queries/orders';
import {
  PageHeader,
  StatusTabs,
  SearchBar,
  SectionCard,
  Pagination,
  Badge,
} from '@/components/ui';

export const metadata = { title: '주문 관리' };

// ─── Tab config ───────────────────────────────────────────────────────────────

const STATUS_TABS: Array<{ value: OrderStatusFilter; label: string }> = [
  { value: 'ALL', label: '전체' },
  { value: 'PENDING_PAYMENT', label: '결제 대기' },
  { value: 'PAID', label: '결제 완료' },
  { value: 'PREPARING', label: '배송 준비' },
  { value: 'SHIPPED', label: '배송 중' },
  { value: 'DELIVERED', label: '배달 완료' },
  { value: 'CONFIRMED', label: '구매 확정' },
  { value: 'RETURN_REQUESTED', label: '반품 요청' },
  { value: 'REFUND_REQUESTED', label: '환불 요청' },
  { value: 'CANCELLED', label: '취소' },
];

// ─── Badge variant map ─────────────────────────────────────────────────────────

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple' | 'accent';

const ORDER_STATUS_VARIANT: Partial<Record<OrderStatus, BadgeVariant>> = {
  PAID: 'success',
  DELIVERED: 'success',
  CONFIRMED: 'success',
  PREPARING: 'info',
  SHIPPED: 'info',
  PENDING_PAYMENT: 'neutral',
  RETURN_REQUESTED: 'warning',
  REFUND_REQUESTED: 'warning',
  CANCELLED: 'danger',
};

// ─── Currency formatter ───────────────────────────────────────────────────────

function formatAmount(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${currency}`;
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function OrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = (params.status as OrderStatusFilter) ?? 'ALL';
  const search = params.search ?? '';
  const page = Number(params.page ?? 1);

  const result = await adminListOrders({ status, search: search || undefined, page });

  function buildTabHref(value: OrderStatusFilter) {
    const q = new URLSearchParams({ status: value });
    if (search) q.set('search', search);
    return `/orders?${q.toString()}`;
  }

  function buildPageHref(p: number) {
    const q = new URLSearchParams({ status, page: String(p) });
    if (search) q.set('search', search);
    return `/orders?${q.toString()}`;
  }

  return (
    <div>
      <PageHeader title="주문 관리" />

      {/* Filters row */}
      <div className="flex flex-wrap items-start gap-3 mb-6">
        <StatusTabs
          tabs={STATUS_TABS}
          current={status}
          buildHref={buildTabHref}
        />
        <SearchBar
          defaultValue={search}
          placeholder="주문번호 검색"
          hiddenFields={[{ name: 'status', value: status }]}
          resetHref={`/orders?status=${status}`}
        />
      </div>

      {/* Table */}
      <SectionCard noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-muted)] border-b border-[var(--color-border)]">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">주문번호</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">고객</th>
                <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">결제금액</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">상태</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">주문일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {result.data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-[var(--color-text-tertiary)]">
                    해당 주문이 없습니다.
                  </td>
                </tr>
              ) : (
                result.data.map((order) => {
                  const orderStatus = order.status as OrderStatus;
                  return (
                    <tr key={order.id} className="hover:bg-[var(--color-surface-muted)] transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/orders/${order.id}`}
                          className="font-mono text-xs text-[var(--color-link)] hover:underline font-medium"
                        >
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {order.user ? (
                          <div>
                            <p className="font-medium text-[var(--color-text-primary)]">{order.user.name}</p>
                            <p className="text-xs text-[var(--color-text-secondary)]">{order.user.email}</p>
                          </div>
                        ) : (
                          <span className="text-[var(--color-text-tertiary)]">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-[var(--color-text-primary)]">
                        {formatAmount(order.total_amount, order.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={ORDER_STATUS_VARIANT[orderStatus] ?? 'neutral'}>
                          {ORDER_STATUS_LABEL[orderStatus] ?? order.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                        {new Date(order.ordered_at).toLocaleDateString('ko-KR')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <Pagination
        page={page}
        total={result.total}
        perPage={result.per_page}
        hasNext={result.has_next}
        buildHref={buildPageHref}
      />
    </div>
  );
}
