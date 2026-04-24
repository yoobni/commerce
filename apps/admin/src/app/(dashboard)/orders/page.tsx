import Link from 'next/link';
import type { OrderStatus } from '@commerce/types';
import {
  adminListOrders,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_BADGE,
  type OrderStatusFilter,
} from '@/lib/queries/orders';

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

  return (
    <div>
      <h1 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6">주문 관리</h1>

      {/* Status tabs — scrollable on small screens */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-4 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/orders?status=${tab.value}${search ? `&search=${search}` : ''}`}
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

      {/* Search */}
      <form method="GET" className="flex gap-2 mb-6">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="주문번호 검색"
          className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input type="hidden" name="status" value={status} />
        <button
          type="submit"
          className="px-4 py-1.5 text-sm bg-[var(--color-sidebar)] text-white rounded-lg hover:opacity-90"
        >
          검색
        </button>
        {search && (
          <Link
            href={`/orders?status=${status}`}
            className="px-4 py-1.5 text-sm border border-[var(--color-border)] rounded-lg hover:bg-gray-50 text-[var(--color-text-secondary)]"
          >
            초기화
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-[var(--color-border)]">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">주문번호</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">고객</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">결제금액</th>
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
              result.data.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-mono text-xs text-blue-600 hover:underline"
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
                  <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">
                    {formatAmount(order.total_amount, order.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        ORDER_STATUS_BADGE[order.status as OrderStatus] ?? 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {ORDER_STATUS_LABEL[order.status as OrderStatus] ?? order.status}
                    </span>
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
          <span>총 {result.total.toLocaleString()}건 · {page}페이지</span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/orders?status=${status}&search=${search}&page=${page - 1}`}
                className="px-3 py-1 border border-[var(--color-border)] rounded hover:bg-gray-50"
              >
                이전
              </Link>
            )}
            {result.has_next && (
              <Link
                href={`/orders?status=${status}&search=${search}&page=${page + 1}`}
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
