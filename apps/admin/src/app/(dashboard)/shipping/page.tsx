import Link from 'next/link';
import type { OrderStatus, ShipmentStatus } from '@commerce/types';
import { adminListShippingOrders } from '@/lib/queries/shipments';
import {
  PageHeader,
  StatusTabs,
  SearchBar,
  SectionCard,
  Pagination,
  Badge,
} from '@/components/ui';

// ─── Labels & badge variants ───────────────────────────────────────────────────

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple' | 'accent';

const ORDER_STATUS_LABEL: Partial<Record<OrderStatus, string>> = {
  PREPARING: '배송 준비',
  SHIPPED: '배송 중',
  DELIVERED: '배송 완료',
};

const ORDER_STATUS_VARIANT: Partial<Record<OrderStatus, BadgeVariant>> = {
  PREPARING: 'info',
  SHIPPED: 'info',
  DELIVERED: 'success',
};

const SHIPMENT_STATUS_LABEL: Record<ShipmentStatus, string> = {
  PENDING: '대기',
  PICKED_UP: '수거 완료',
  IN_TRANSIT: '배송 중',
  CUSTOMS_HELD: '통관 보류',
  OUT_FOR_DELIVERY: '배달 중',
  DELIVERED: '배달 완료',
  RETURNED: '반송',
};

const STATUS_TABS: Array<{
  value: 'ALL' | 'PREPARING' | 'SHIPPED' | 'DELIVERED';
  label: string;
}> = [
  { value: 'ALL', label: '전체' },
  { value: 'PREPARING', label: '배송 준비' },
  { value: 'SHIPPED', label: '배송 중' },
  { value: 'DELIVERED', label: '배송 완료' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function ShippingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = (params.status as 'ALL' | 'PREPARING' | 'SHIPPED' | 'DELIVERED') ?? 'ALL';
  const search = params.search ?? '';
  const page = Number(params.page ?? 1);

  const result = await adminListShippingOrders({
    status,
    search: search || undefined,
    page,
  });

  function buildTabHref(value: 'ALL' | 'PREPARING' | 'SHIPPED' | 'DELIVERED') {
    const q = new URLSearchParams({ status: value });
    if (search) q.set('search', search);
    return `/shipping?${q.toString()}`;
  }

  function buildPageHref(p: number) {
    const q = new URLSearchParams({ status, page: String(p) });
    if (search) q.set('search', search);
    return `/shipping?${q.toString()}`;
  }

  return (
    <div>
      <PageHeader title="배송 관리" />

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
          resetHref={`/shipping?status=${status}`}
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
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">주문 상태</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">배송 상태</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">운송장</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">주문일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {result.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[var(--color-text-tertiary)]">
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
                          href={`/shipping/${order.id}`}
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
                      <td className="px-4 py-3">
                        <Badge variant={ORDER_STATUS_VARIANT[orderStatus] ?? 'neutral'}>
                          {ORDER_STATUS_LABEL[orderStatus] ?? order.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {order.shipment ? (
                          <span className="text-xs text-[var(--color-text-secondary)]">
                            {SHIPMENT_STATUS_LABEL[order.shipment.status as ShipmentStatus]}
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--color-warning)] font-medium">송장 미입력</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-secondary)]">
                        {order.shipment ? order.shipment.tracking_number : '-'}
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
