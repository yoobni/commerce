import Link from 'next/link';
import type { OrderStatus, ShipmentStatus } from '@commerce/types';
import { adminListShippingOrders } from '@/lib/queries/shipments';

// ─── Labels & badges ──────────────────────────────────────────────────────────

const ORDER_STATUS_LABEL: Partial<Record<OrderStatus, string>> = {
  PREPARING: '배송 준비',
  SHIPPED: '배송 중',
  DELIVERED: '배송 완료',
};

const ORDER_STATUS_BADGE: Partial<Record<OrderStatus, string>> = {
  PREPARING: 'bg-indigo-100 text-indigo-700',
  SHIPPED: 'bg-violet-100 text-violet-700',
  DELIVERED: 'bg-green-100 text-green-700',
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

  return (
    <div>
      <h1 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6">배송 관리</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={`/shipping?status=${tab.value}${search ? `&search=${search}` : ''}`}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                status === tab.value
                  ? 'bg-white text-[var(--color-text-primary)] shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <form method="GET" className="flex gap-2 ml-auto">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="주문번호 검색"
            className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-lg w-52 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input type="hidden" name="status" value={status} />
          <button
            type="submit"
            className="px-4 py-1.5 text-sm bg-[var(--color-sidebar)] text-white rounded-lg hover:opacity-90"
          >
            검색
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-[var(--color-border)]">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                주문번호
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                고객
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                주문 상태
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                배송 상태
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                운송장
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                주문일
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {result.data.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-[var(--color-text-tertiary)]"
                >
                  해당 주문이 없습니다.
                </td>
              </tr>
            ) : (
              result.data.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/shipping/${order.id}`}
                      className="font-mono text-xs text-blue-600 hover:underline"
                    >
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {order.user ? (
                      <div>
                        <p className="font-medium text-[var(--color-text-primary)]">
                          {order.user.name}
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          {order.user.email}
                        </p>
                      </div>
                    ) : (
                      <span className="text-[var(--color-text-tertiary)]">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        ORDER_STATUS_BADGE[order.status] ?? 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {ORDER_STATUS_LABEL[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {order.shipment ? (
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        {SHIPMENT_STATUS_LABEL[order.shipment.status as ShipmentStatus]}
                      </span>
                    ) : (
                      <span className="text-xs text-orange-500 font-medium">송장 미입력</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-secondary)]">
                    {order.shipment ? order.shipment.tracking_number : '-'}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {new Date(order.ordered_at).toLocaleDateString('ko-KR')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {result.total > result.per_page && (
        <div className="flex items-center justify-between mt-4 text-sm text-[var(--color-text-secondary)]">
          <span>
            총 {result.total.toLocaleString()}건 · {page}페이지
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/shipping?status=${status}&search=${search}&page=${page - 1}`}
                className="px-3 py-1 border border-[var(--color-border)] rounded hover:bg-gray-50"
              >
                이전
              </Link>
            )}
            {result.has_next && (
              <Link
                href={`/shipping?status=${status}&search=${search}&page=${page + 1}`}
                className="px-3 py-1 border border-[var(--color-border)] rounded hover:bg-gray-50"
              >
                다음
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
