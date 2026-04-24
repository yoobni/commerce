'use client';

import { useTransition } from 'react';
import type { OrderStatus } from '@commerce/types';
import { ORDER_STATUS_LABEL, ORDER_STATUS_TRANSITIONS } from '@/lib/queries/orders';
import { updateOrderStatus } from '@/lib/actions/orders';

interface OrderStatusActionsProps {
  orderId: string;
  currentStatus: OrderStatus;
}

export default function OrderStatusActions({ orderId, currentStatus }: OrderStatusActionsProps) {
  const [isPending, startTransition] = useTransition();

  const nextStatuses = ORDER_STATUS_TRANSITIONS[currentStatus] ?? [];

  if (nextStatuses.length === 0) return null;

  function handleChange(newStatus: OrderStatus) {
    const label = ORDER_STATUS_LABEL[newStatus];
    if (!confirm(`주문 상태를 "${label}"으로 변경하시겠습니까?`)) return;

    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, newStatus);
      } catch (err) {
        alert(err instanceof Error ? err.message : '상태 변경에 실패했습니다.');
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {nextStatuses.map((status) => {
        const isDanger = status === 'CANCELLED' || status === 'REFUNDED';
        return (
          <button
            key={status}
            onClick={() => handleChange(status)}
            disabled={isPending}
            className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-colors disabled:opacity-50 ${
              isDanger
                ? 'border border-red-300 text-red-600 hover:bg-red-50'
                : 'bg-[var(--color-sidebar)] text-white hover:opacity-90'
            }`}
          >
            {ORDER_STATUS_LABEL[status]}
          </button>
        );
      })}
    </div>
  );
}
