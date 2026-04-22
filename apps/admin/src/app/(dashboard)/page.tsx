import type { OrderStatus } from '@commerce/types';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { OrderStatusBars } from '@/components/dashboard/OrderStatusBars';
import {
  adminGetRevenueKPI,
  adminGetOrderCountKPI,
  adminGetMemberKPI,
  adminGetLowStockProducts,
  adminGetRecentOrders,
  adminGetDailyRevenue,
  adminGetOrderStatusCounts,
} from '@/lib/queries/dashboard';

export const metadata = { title: '대시보드' };
export const dynamic = 'force-dynamic'; // always fresh

// ─── Formatting helpers ───────────────────────────────────────────────────────

function formatKRW(n: number): string {
  return `₩${n.toLocaleString('ko-KR')}`;
}

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: '결제대기',
  PAID: '결제완료',
  PREPARING: '준비중',
  SHIPPED: '배송중',
  DELIVERED: '배송완료',
  CONFIRMED: '구매확정',
  RETURN_REQUESTED: '반품요청',
  RETURNED: '반품완료',
  REFUND_REQUESTED: '환불요청',
  REFUNDED: '환불완료',
  CANCELLED: '취소',
  DELIVERY_FAILED: '배송실패',
};

const ORDER_STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-purple-100 text-purple-700',
  SHIPPED: 'bg-cyan-100 text-cyan-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  RETURN_REQUESTED: 'bg-orange-100 text-orange-700',
  RETURNED: 'bg-gray-100 text-gray-500',
  REFUND_REQUESTED: 'bg-red-100 text-red-600',
  REFUNDED: 'bg-gray-100 text-gray-400',
  CANCELLED: 'bg-red-100 text-red-700',
  DELIVERY_FAILED: 'bg-red-200 text-red-800',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const [revenue, orderKPI, members, lowStock, recentOrders, dailyRevenue, statusCounts] =
    await Promise.all([
      adminGetRevenueKPI(),
      adminGetOrderCountKPI(),
      adminGetMemberKPI(),
      adminGetLowStockProducts(),
      adminGetRecentOrders(),
      adminGetDailyRevenue(),
      adminGetOrderStatusCounts(),
    ]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6">대시보드</h1>

      {/* ── KPI 카드 ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="매출 (당월)"
          value={formatKRW(revenue.month)}
          sub={`주간 ${formatKRW(revenue.week)} · 오늘 ${formatKRW(revenue.today)}`}
          accent
        />
        <KpiCard
          title="주문 수 (당월)"
          value={orderKPI.month.toLocaleString()}
          sub={`주간 ${orderKPI.week.toLocaleString()} · 오늘 ${orderKPI.today.toLocaleString()}`}
        />
        <KpiCard
          title="신규 회원 (당월)"
          value={members.month.toLocaleString()}
          sub={`주간 ${members.week.toLocaleString()} · 오늘 ${members.today.toLocaleString()}`}
        />
        <KpiCard
          title="총 회원"
          value={members.total.toLocaleString()}
          note={`활성 주문 ${orderKPI.total_active.toLocaleString()}건`}
        />
      </div>

      {/* ── 차트 영역 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <RevenueChart data={dailyRevenue} />
        </div>
        <div>
          <OrderStatusBars counts={statusCounts} />
        </div>
      </div>

      {/* ── 재고 부족 알림 ── */}
      {lowStock.length > 0 && (
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">재고 부족 알림</p>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
              {lowStock.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left pb-2 text-xs font-medium text-[var(--color-text-secondary)]">
                    상품명
                  </th>
                  <th className="text-left pb-2 text-xs font-medium text-[var(--color-text-secondary)]">
                    SKU
                  </th>
                  <th className="text-left pb-2 text-xs font-medium text-[var(--color-text-secondary)]">
                    사이즈 / 컬러
                  </th>
                  <th className="text-right pb-2 text-xs font-medium text-[var(--color-text-secondary)]">
                    재고
                  </th>
                  <th className="text-right pb-2 text-xs font-medium text-[var(--color-text-secondary)]">
                    임계값
                  </th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((p) => (
                  <tr
                    key={p.option_id}
                    className="border-b border-[var(--color-border-subtle)] last:border-0"
                  >
                    <td className="py-2.5 text-[var(--color-text-primary)]">{p.name_ko}</td>
                    <td className="py-2.5 font-mono text-xs text-[var(--color-text-secondary)]">
                      {p.sku}
                    </td>
                    <td className="py-2.5 text-[var(--color-text-secondary)]">
                      {[p.size_label, p.color].filter(Boolean).join(' / ')}
                    </td>
                    <td className="py-2.5 text-right font-semibold text-red-600">{p.stock}</td>
                    <td className="py-2.5 text-right text-[var(--color-text-tertiary)]">
                      {p.low_stock_threshold}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 최근 주문 ── */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
        <p className="text-sm font-medium text-[var(--color-text-primary)] mb-4">최근 주문</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left pb-2 text-xs font-medium text-[var(--color-text-secondary)]">
                  주문번호
                </th>
                <th className="text-left pb-2 text-xs font-medium text-[var(--color-text-secondary)]">
                  회원
                </th>
                <th className="text-left pb-2 text-xs font-medium text-[var(--color-text-secondary)]">
                  상태
                </th>
                <th className="text-right pb-2 text-xs font-medium text-[var(--color-text-secondary)]">
                  금액
                </th>
                <th className="text-right pb-2 text-xs font-medium text-[var(--color-text-secondary)]">
                  주문일시
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-sm text-[var(--color-text-tertiary)]"
                  >
                    주문 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[var(--color-border-subtle)] last:border-0"
                  >
                    <td className="py-2.5 font-mono text-xs text-[var(--color-text-primary)]">
                      {order.order_number}
                    </td>
                    <td className="py-2.5">
                      <span className="text-[var(--color-text-primary)]">
                        {order.user_name ?? '—'}
                      </span>
                      {order.user_email && (
                        <span className="block text-xs text-[var(--color-text-tertiary)]">
                          {order.user_email}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${ORDER_STATUS_BADGE[order.status]}`}
                      >
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-medium text-[var(--color-text-primary)]">
                      {formatKRW(order.total_amount)}
                    </td>
                    <td className="py-2.5 text-right text-xs text-[var(--color-text-secondary)]">
                      {new Date(order.ordered_at).toLocaleString('ko-KR', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
