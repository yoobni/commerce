'use client';

import { useActionState } from 'react';
import { grantPoints } from '@/lib/actions/members';

interface Props {
  userId: string;
}

function grantAction(
  _: { error: string | null; success: boolean },
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const userId = formData.get('userId') as string;
  const amount = Number(formData.get('amount'));
  const reason = formData.get('reason') as string;

  return grantPoints({ userId, amount, reason })
    .then(() => ({ error: null, success: true }))
    .catch((e: unknown) => ({
      error: e instanceof Error ? e.message : '처리 중 오류가 발생했습니다.',
      success: false,
    }));
}

export function GrantPointsForm({ userId }: Props) {
  const [state, formAction, pending] = useActionState(grantAction, {
    error: null,
    success: false,
  });

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="userId" value={userId} />

      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
          지급 포인트
        </label>
        <input
          type="number"
          name="amount"
          required
          min={1}
          placeholder="예: 1000"
          className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
          지급 사유
        </label>
        <input
          type="text"
          name="reason"
          required
          placeholder="예: 이벤트 보상"
          className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state.success && <p className="text-xs text-green-600">포인트가 지급되었습니다.</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
      >
        {pending ? '처리 중...' : '포인트 지급'}
      </button>
    </form>
  );
}
