'use client';

import { useActionState } from 'react';
import { updateAdminMemo } from '@/lib/actions/orders';

interface Props {
  orderId: string;
  defaultMemo: string | null;
}

function memoAction(
  _: { error: string | null; saved: boolean },
  formData: FormData
): Promise<{ error: string | null; saved: boolean }> {
  const orderId = formData.get('orderId') as string;
  const memo = formData.get('memo') as string;

  return updateAdminMemo(orderId, memo)
    .then(() => ({ error: null, saved: true }))
    .catch((e: unknown) => ({
      error: e instanceof Error ? e.message : '처리 중 오류가 발생했습니다.',
      saved: false,
    }));
}

export function AdminMemoForm({ orderId, defaultMemo }: Props) {
  const [state, formAction, pending] = useActionState(memoAction, { error: null, saved: false });

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="orderId" value={orderId} />

      <textarea
        name="memo"
        rows={4}
        defaultValue={defaultMemo ?? ''}
        placeholder="어드민 메모 (고객에게 노출 안 됨)"
        className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state.saved && !state.error && (
        <p className="text-xs text-green-600">저장되었습니다.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-2 text-sm font-medium bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-60 transition-colors"
      >
        {pending ? '저장 중...' : '메모 저장'}
      </button>
    </form>
  );
}
