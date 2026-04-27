'use client';

import { useTransition } from 'react';
import type { OrderStatus } from '@commerce/types';
import { updateOrderStatus } from '@/lib/actions/orders';
import { ORDER_STATUS_LABEL } from '@/lib/queries/orders';

// ─── Valid next transitions (must match server-side actions/orders.ts) ────────

// NOTE: REFUND_REQUESTED → REFUNDED is handled by <RefundForm> (PG + side-effects).
// Keep it out of this component to prevent bypassing payment cancellation.
const ORDER_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING_PAYMENT: ['CANCELLED'],
  PAID: ['PREPARING', 'CANCELLED'],
  PREPARING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['CONFIRMED', 'RETURN_REQUESTED'],
  RETURN_REQUESTED: ['RETURNED', 'PREPARING'],
  RETURNED: ['REFUND_REQUESTED'],
  REFUND_REQUESTED: [], // handled by RefundForm — do not show a direct button here
  DELIVERY_FAILED: ['RETURN_REQUESTED', 'CANCELLED'],
};

const NEXT_STATUS_STYLE: Partial<Record<OrderStatus, string>> = {
  PREPARING: 'bg-indigo-600 text-white hover:bg-indigo-700',
  SHIPPED: 'bg-violet-600 text-white hover:bg-violet-700',
  DELIVERED: 'bg-green-600 text-white hover:bg-green-700',
  CONFIRMED: 'bg-emerald-600 text-white hover:bg-emerald-700',
  RETURNED: 'bg-amber-600 text-white hover:bg-amber-700',
  REFUNDED: 'bg-gray-600 text-white hover:bg-gray-700',
  CANCELLED: 'border border-red-300 text-red-600 hover:bg-red-50',
  RETURN_REQUESTED: 'border border-orange-300 text-orange-600 hover:bg-orange-50',
  REFUND_REQUESTED: 'border border-red-300 text-red-600 hover:bg-red-50',
};

interface OrderStatusActionsProps {
  orderId: string;
  currentStatus: OrderStatus;
}

export function OrderStatusActions({ orderId, currentStatus }: OrderStatusActionsProps) {
  const [isPending, startTransition] = useTransition();
  const nextStatuses = ORDER_TRANSITIONS[currentStatus] ?? [];

  if (nextStatuses.length === 0) return null;

  const handleChange = (newStatus: OrderStatus) => {
    const label = ORDER_STATUS_LABEL[newStatus];
    if (!confirm(`주문 상태를 "${label}"(으)로 변경하시겠습니까?`)) return;

    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, newStatus);
      } catch (err) {
        alert(err instanceof Error ? err.message : '오류가 발생했습니다.');
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {nextStatuses.map((next) => (
        <button
          key={next}
          onClick={() => handleChange(next)}
          disabled={isPending}
          className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors disabled:opacity-50 ${
            NEXT_STATUS_STYLE[next] ?? 'border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-gray-50'
          }`}
        >
          {ORDER_STATUS_LABEL[next]}으로 변경
        </button>
      ))}
    </div>
  );
}
