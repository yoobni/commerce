import Link from 'next/link';
import type { OrderStatus } from '@commerce/types';
import { getDashboardStats } from '@/lib/queries/stats';
import { ORDER_STATUS_LABEL, ORDER_STATUS_BADGE } from '@/lib/queries/orders';
import { StatCard, BarChart, SectionCard, Badge } from '@/components/ui';

export const metadata = { title: '대시보드' };

// ─── Status badge mapping → Badge variant ─────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const todayRevenueFormatted = stats.todayRevenue.toLocaleString('ko-KR');
  const weekRevenueFormatted = stats.weekRevenue.toLocaleString('ko-KR');

  const orderChartData = stats.dailyStats.map((d) => ({
    label: d.date,
    value: d.orderCount,
  }));

  const revenueChartData = stats.dailyStats.map((d) => ({
    label: d.date,
    value: d.revenue,
  }));

  return (
    <div>
      <h1 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6">
        대시보드
      </h1>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="오늘 주문"
          value={`${stats.todayOrders}건`}
          sub={`₩${todayRevenueFormatted}`}
          accent
        />
        <StatCard
          label="주간 주문"
          value={`${stats.weekOrders}건`}
          sub={`₩${weekRevenueFormatted}`}
        />
        <StatCard
          label="전체 회원"
          value={`${stats.totalMembers.toLocaleString()}명`}
          sub={`오늘 +${stats.newMembersToday}명`}
        />
        <StatCard
          label="처리 대기"
          value={`${stats.pendingOrders}건`}
          sub={`반품/환불 ${stats.returnRequests}건`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <SectionCard title="일별 주문 수 (최근 7일)">
          <BarChart data={orderChartData} color="primary" height={80} />
        </SectionCard>
        <SectionCard title="일별 매출 (최근 7일, KRW)">
          <BarChart data={revenueChartData} color="accent" height={80} />
        </SectionCard>
      </div>

      {/* Quick shortcuts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { href: '/orders?status=PENDING_PAYMENT', label: '결제 대기' },
          { href: '/orders?status=RETURN_REQUESTED', label: '반품 요청' },
          { href: '/orders?status=REFUND_REQUESTED', label: '환불 요청' },
          { href: '/members?status=SUSPENDED', label: '정지 회원' },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)] transition-colors text-center"
          >
            {label} →
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <SectionCard title="최근 주문" titleHref="/orders" noPadding>
        {stats.recentOrders.length === 0 ? (
          <p className="px-5 py-10 text-sm text-center text-[var(--color-text-tertiary)]">
            주문이 없습니다.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-surface-muted)] border-b border-[var(--color-border)]">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">주문번호</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">고객</th>
                  <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">금액</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">상태</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">주문일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {stats.recentOrders.map((order) => {
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
                        {order.user_name ? (
                          <div>
                            <p className="font-medium text-[var(--color-text-primary)]">{order.user_name}</p>
                            <p className="text-xs text-[var(--color-text-secondary)]">{order.user_email}</p>
                          </div>
                        ) : (
                          <span className="text-[var(--color-text-tertiary)]">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-[var(--color-text-primary)]">
                        {order.total_amount.toLocaleString()} {order.currency}
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
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
