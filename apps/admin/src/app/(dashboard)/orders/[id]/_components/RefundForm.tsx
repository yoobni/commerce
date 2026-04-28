'use client';

import { useState, useTransition } from 'react';
import { processRefund } from '@/lib/actions/orders';

interface RefundFormProps {
  orderId: string;
  maxRefundable: number;
  currency: string;
}

export function RefundForm({ orderId, maxRefundable, currency }: RefundFormProps) {
  const [amount, setAmount] = useState(String(maxRefundable));
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError('유효한 금액을 입력하세요.');
      return;
    }
    if (parsed > maxRefundable) {
      setError(`최대 환불 가능 금액: ${maxRefundable.toLocaleString()} ${currency}`);
      return;
    }
    if (!confirm(`${parsed.toLocaleString()} ${currency} 환불 처리하시겠습니까?`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await processRefund(orderId, parsed);
      } catch (err) {
        setError(err instanceof Error ? err.message : '환불 처리 중 오류가 발생했습니다.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label
          htmlFor="refund-amount"
          className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1"
        >
          환불 금액 ({currency})
        </label>
        <div className="flex gap-2">
          <input
            id="refund-amount"
            type="number"
            min={1}
            max={maxRefundable}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isPending}
            className="flex-1 px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? '처리중…' : '환불 처리'}
          </button>
        </div>
        <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
          최대 환불 가능: {maxRefundable.toLocaleString()} {currency}
        </p>
      </div>
      {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
    </form>
  );
}
