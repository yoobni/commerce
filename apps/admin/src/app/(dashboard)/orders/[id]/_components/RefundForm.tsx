'use client';

import { useActionState } from 'react';
import { processRefund } from '@/lib/actions/orders';
import type { ProcessRefundInput } from '@/lib/actions/orders';

interface Props {
  orderId: string;
  totalAmount: number;
  currency: string;
}

function refundAction(
  _: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const orderId = formData.get('orderId') as string;
  const reason = (formData.get('reason') as string).trim();
  const amountStr = formData.get('amount') as string;

  const input: ProcessRefundInput = {
    reason,
    amount: amountStr ? parseFloat(amountStr) : undefined,
  };

  return processRefund(orderId, input)
    .then(() => ({ error: null }))
    .catch((e: unknown) => ({
      error: e instanceof Error ? e.message : '환불 처리 중 오류가 발생했습니다.',
    }));
}

export function RefundForm({ orderId, totalAmount, currency }: Props) {
  const [state, formAction, pending] = useActionState(refundAction, { error: null });

  const formattedMax = (() => {
    try {
      return new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      }).format(totalAmount);
    } catch {
      return `${totalAmount.toLocaleString()} ${currency}`;
    }
  })();

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="orderId" value={orderId} />

      {/* Refund amount (optional — defaults to full) */}
      <div>
        <label
          htmlFor="refund-amount"
          className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1"
        >
          환불 금액
          <span className="ml-1 text-[var(--color-text-tertiary)] font-normal">
            (비워두면 전액 {formattedMax})
          </span>
        </label>
        <input
          id="refund-amount"
          type="number"
          name="amount"
          placeholder={`최대 ${formattedMax}`}
          min={1}
          max={totalAmount}
          step={1}
          className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      {/* Reason (required) */}
      <div>
        <label
          htmlFor="refund-reason"
          className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1"
        >
          환불 사유 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="refund-reason"
          name="reason"
          required
          rows={2}
          placeholder="환불 사유를 입력하세요."
          className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      {state.error && (
        <p className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors"
      >
        {pending ? '환불 처리 중…' : '환불 처리 (PG 취소 + 포인트/쿠폰 복구)'}
      </button>
    </form>
  );
}
