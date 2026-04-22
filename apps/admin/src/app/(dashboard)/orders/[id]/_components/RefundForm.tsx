'use client';

import { useActionState } from 'react';
import { processRefund } from '@/lib/actions/orders';
import type { Currency } from '@commerce/types';

interface Props {
  orderId: string;
  defaultAmount: number;
  currency: Currency;
}

function refundAction(
  _: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const orderId = formData.get('orderId') as string;
  const refundAmount = Number(formData.get('refundAmount'));

  return processRefund({ orderId, refundAmount })
    .then(() => ({ error: null }))
    .catch((e: unknown) => ({
      error: e instanceof Error ? e.message : '처리 중 오류가 발생했습니다.',
    }));
}

export function RefundForm({ orderId, defaultAmount, currency }: Props) {
  const [state, formAction, pending] = useActionState(refundAction, { error: null });

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="orderId" value={orderId} />

      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
          환불 금액 ({currency})
        </label>
        <input
          type="number"
          name="refundAmount"
          required
          min={1}
          defaultValue={defaultAmount}
          className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      {state.error && (
        <p className="text-xs text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors"
      >
        {pending ? '처리 중...' : '환불 처리'}
      </button>
    </form>
  );
}
