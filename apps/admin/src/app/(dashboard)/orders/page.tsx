import Link from 'next/link';
import type { OrderStatus, PaymentMethod } from '@commerce/types';
import { adminListOrders } from '@/lib/queries/orders';

// ─── Labels & badges ──────────────────────────────────────────────────────────

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: '결제 대기',
  PAID: '결제 완료',
  PREPARING: '준비 중',
  SHIPPED: '배송 중',
  DELIVERED: '배송 완료',
  CONFIRMED: '구매 확정',
  RETURN_REQUESTED: '반품 요청',
  RETURNED: '반품 완료',
  REFUND_REQUESTED: '환불 요청',
  REFUNDED: '환불 완료',
  CANCELLED: '취소',
  DELIVERY_FAILED: '배송 실패',
};

const ORDER_STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'bg-gray-100 text-gray-500',
  PAID: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-indigo-100 text-indigo-700',
  SHIPPED: 'bg-violet-100 text-violet-700',
  DELIVERED: 'bg-teal-100 text-teal-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  RETURN_REQUESTED: 'bg-orange-100 text-orange-700',
  RETURNED: 'bg-orange-100 text-orange-600',
  REFUND_REQUESTED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-red-100 text-red-600',
  CANCELLED: 'bg-gray-100 text-gray-500',
  DELIVERY_FAILED: 'bg-red-100 text-red-800',
};

const PAYMENT_METHOD_LABEL: Partial<Record<PaymentMethod, string>> = {
  CARD: '카드',
  KAKAO_PAY: '카카오페이',
  NAVER_PAY: '네이버페이',
  TOSS_PAY: '토스페이',
  STRIPE: 'Stripe',
  KLARNA: 'Klarna',
};

// Status tabs shown in the filter bar
const STATUS_TABS: Array<{ value: OrderStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: '전체' },
  { value: 'PAID', label: '결제완료' },
  { value: 'PREPARING', label: '준비 중' },
  { value: 'SHIPPED', label: '배송 중' },
  { value: 'DELIVERED', label: '배송완료' },
  { value: 'RETURN_REQUESTED', label: '반품요청' },
  { value: 'CANCELLED', label: '취소' },
];

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
  const status = (params.status as OrderStatus | 'ALL') ?? 'ALL';
  const search = params.search ?? '';
  const page = Number(params.page ?? 1);

  const result = await adminListOrders({ status, search: search || undefined, page });

  return (
    <div>
      <h1 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6">주문 관리</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Status tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg flex-wrap">
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
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">주문번호</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">고객</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">상태</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">결제수단</th>
              <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">결제금액</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">주문일</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {result.data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-[var(--color-text-tertiary)]">
                  주문이 없습니다.
                </td>
              </tr>
            ) : (
              result.data.map((order) => {
                const paymentData = Array.isArray(order.payment)
                  ? (order.payment[0] ?? null)
                  : order.payment;
                return (
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
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${ORDER_STATUS_BADGE[order.status]}`}
                      >
                        {ORDER_STATUS_LABEL[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                      {paymentData
                        ? (PAYMENT_METHOD_LABEL[paymentData.method as PaymentMethod] ?? paymentData.method)
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {order.total_amount.toLocaleString()}
                      <span className="text-xs text-[var(--color-text-secondary)] ml-1">
                        {order.currency}
                      </span>
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

      {/* Pagination */}
      {result.total > result.per_page && (
        <div className="flex items-center justify-between mt-4 text-sm text-[var(--color-text-secondary)]">
          <span>
            총 {result.total.toLocaleString()}건 · {page}페이지
          </span>
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
