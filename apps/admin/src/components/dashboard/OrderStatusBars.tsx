'use client';

import type { OrderStatus } from '@commerce/types';
import type { OrderStatusCounts } from '@/lib/queries/dashboard';

const STATUS_LABELS: Record<OrderStatus, string> = {
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

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: '#f59e0b',
  PAID: '#3b82f6',
  PREPARING: '#8b5cf6',
  SHIPPED: '#06b6d4',
  DELIVERED: '#10b981',
  CONFIRMED: '#16a34a',
  RETURN_REQUESTED: '#f97316',
  RETURNED: '#6b7280',
  REFUND_REQUESTED: '#ef4444',
  REFUNDED: '#9ca3af',
  CANCELLED: '#dc2626',
  DELIVERY_FAILED: '#7f1d1d',
};

// Primary statuses shown in the bar chart
const DISPLAY_STATUSES: OrderStatus[] = [
  'PENDING_PAYMENT',
  'PAID',
  'PREPARING',
  'SHIPPED',
  'DELIVERED',
  'CONFIRMED',
  'CANCELLED',
];

interface OrderStatusBarsProps {
  counts: OrderStatusCounts;
}

export function OrderStatusBars({ counts }: OrderStatusBarsProps) {
  const items = DISPLAY_STATUSES.map((s) => ({ status: s, count: counts[s] }));
  const maxCount = Math.max(...items.map((d) => d.count), 1);

  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] p-5 h-full">
      <p className="text-sm font-medium text-[var(--color-text-primary)] mb-4">주문 현황</p>
      <div className="space-y-3">
        {items.map(({ status, count }) => (
          <div key={status}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-[var(--color-text-secondary)]">
                {STATUS_LABELS[status]}
              </span>
              <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                {count.toLocaleString()}
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(count / maxCount) * 100}%`,
                  backgroundColor: STATUS_COLORS[status],
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Secondary statuses (returns/refunds) as compact pills */}
      <div className="mt-4 pt-3 border-t border-[var(--color-border-subtle)] flex flex-wrap gap-2">
        {(['RETURN_REQUESTED', 'RETURNED', 'REFUND_REQUESTED', 'REFUNDED', 'DELIVERY_FAILED'] as OrderStatus[]).map(
          (s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-gray-50 border border-[var(--color-border)]"
            >
              <span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{ backgroundColor: STATUS_COLORS[s] }}
              />
              <span className="text-[var(--color-text-secondary)]">{STATUS_LABELS[s]}</span>
              <span className="font-medium text-[var(--color-text-primary)]">
                {counts[s].toLocaleString()}
              </span>
            </span>
          )
        )}
      </div>
    </div>
  );
}
