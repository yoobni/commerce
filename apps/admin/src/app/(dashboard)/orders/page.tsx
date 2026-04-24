import Link from 'next/link';
import type { OrderStatus } from '@commerce/types';
import { adminListOrders, ORDER_STATUS_LABEL, ORDER_STATUS_BADGE } from '@/lib/queries/orders';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { StatusTabs } from '@/components/ui/StatusTabs';

export const metadata = { title: '주문 관리' };

// ─── Status tabs ──────────────────────────────────────────────────────────────

const STATUS_TABS: Array<{ value: OrderStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: '전체' },
  { value: 'PENDING_PAYMENT', label: '결제대기' },
  { value: 'PAID', label: '결제완료' },
  { value: 'PREPARING', label: '준비중' },
  { value: 'SHIPPED', label: '배송중' },
  { value: 'DELIVERED', label: '배송완료' },
  { value: 'CONFIRMED', label: '구매확정' },
  { value: 'RETURN_REQUESTED', label: '반품요청' },
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
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}

export default async function OrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = (params.status as OrderStatus | 'ALL') ?? 'ALL';
  const search = params.search ?? '';
  const page = Math.max(1, Number(params.page ?? 1));

  const result = await adminListOrders({ status, search: search || undefined, page });

  function buildQuery(overrides: Record<string, string | undefined>): string {
    const q = new URLSearchParams();
    const merged = {
      status,
      search: search || undefined,
      page: String(page),
      ...overrides,
    };
    Object.entries(merged).forEach(([k, v]) => {
      if (v !== undefined) q.set(k, v);
    });
    const str = q.toString();
    return str ? `/orders?${str}` : '/orders';
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">주문 관리</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <StatusTabs
          tabs={STATUS_TABS}
          activeValue={status}
          buildUrl={(v) => buildQuery({ status: v, page: '1' })}
        />

        <form method="GET" action="/orders" className="flex gap-2 ml-auto">
          <input type="hidden" name="status" value={status} />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="주문번호 검색"
            className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-1.5 text-sm bg-[var(--color-sidebar)] text-white rounded-lg hover:opacity-90 transition-opacity"
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
              <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">결제금액</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">상태</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">주문일</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {result.data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center text-[var(--color-text-tertiary)]">
                  <div className="flex flex-col items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10 text-[var(--color-border)]" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>주문이 없습니다.</span>
                  </div>
                </td>
              </tr>
            ) : (
              result.data.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-mono text-xs font-medium text-blue-600 hover:underline"
                    >
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {order.user ? (
                      <div>
                        <p className="font-medium text-[var(--color-text-primary)]">{order.user.name}</p>
                        <p className="text-xs text-[var(--color-text-tertiary)]">{order.user.email}</p>
                      </div>
                    ) : (
                      <span className="text-[var(--color-text-tertiary)]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-[var(--color-text-primary)]">
                    {formatAmount(order.total_amount, order.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={ORDER_STATUS_BADGE[order.status]}>
                      {ORDER_STATUS_LABEL[order.status]}
                    </Badge>
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

      <Pagination
        page={page}
        total={result.total}
        perPage={result.per_page}
        buildUrl={(p) => buildQuery({ page: String(p) })}
      />
    </div>
  );
}
