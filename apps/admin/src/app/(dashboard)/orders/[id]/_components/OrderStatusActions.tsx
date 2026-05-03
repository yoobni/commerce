'use client';

import { useState, useTransition } from 'react';
import type { OrderStatus } from '@commerce/types';
import { updateOrderStatus } from '@/lib/actions/orders';
import { ORDER_STATUS_LABEL } from '@/lib/queries/orders';

// ─── Valid next transitions (must match server-side actions/orders.ts) ────────

const ORDER_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING_PAYMENT: ['CANCELLED'],
  PAID: ['PREPARING', 'CANCELLED'],
  PREPARING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['CONFIRMED', 'RETURN_REQUESTED'],
  RETURN_REQUESTED: ['RETURNED', 'PREPARING'],
  RETURNED: ['REFUND_REQUESTED'],
  REFUND_REQUESTED: [],
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

// Statuses requiring a reason input before confirming
const REASON_LABELS: Partial<Record<OrderStatus, string>> = {
  CANCELLED: '취소 사유',
  RETURN_REQUESTED: '반품 사유',
};

interface OrderStatusActionsProps {
  orderId: string;
  currentStatus: OrderStatus;
}

export function OrderStatusActions({ orderId, currentStatus }: OrderStatusActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState<OrderStatus | null>(null);
  const [reason, setReason] = useState('');

  const nextStatuses = ORDER_TRANSITIONS[currentStatus] ?? [];
  if (nextStatuses.length === 0) return null;

  const handleClick = (newStatus: OrderStatus) => {
    if (REASON_LABELS[newStatus]) {
      setReason('');
      setConfirming(newStatus);
      return;
    }
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

  const handleConfirmReason = () => {
    if (!confirming) return;
    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, confirming, reason.trim() || undefined);
        setConfirming(null);
      } catch (err) {
        alert(err instanceof Error ? err.message : '오류가 발생했습니다.');
        setConfirming(null);
      }
    });
  };

  if (confirming) {
    const label = ORDER_STATUS_LABEL[confirming];
    const reasonLabel = REASON_LABELS[confirming] ?? '사유';
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-text-primary)]">
          <span className="font-medium">&ldquo;{label}&rdquo;</span>으로 변경합니다.
        </p>
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
            {reasonLabel} <span className="text-[var(--color-text-tertiary)]">(선택)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder={`${reasonLabel}을 입력하세요.`}
            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleConfirmReason}
            disabled={isPending}
            className="flex-1 px-3 py-1.5 text-sm rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? '처리 중…' : `${label}으로 변경`}
          </button>
          <button
            onClick={() => setConfirming(null)}
            disabled={isPending}
            className="px-3 py-1.5 text-sm rounded-lg font-medium border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {nextStatuses.map((next) => (
        <button
          key={next}
          onClick={() => handleClick(next)}
          disabled={isPending}
          className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors disabled:opacity-50 ${
            NEXT_STATUS_STYLE[next] ??
            'border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-gray-50'
          }`}
        >
          {ORDER_STATUS_LABEL[next]}으로 변경
        </button>
      ))}
    </div>
  );
}
