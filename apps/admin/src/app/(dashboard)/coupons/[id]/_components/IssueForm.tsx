'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { issueCouponToUserByEmail } from '@/lib/actions/coupons';

interface State {
  error: string | null;
  success: boolean;
}

function makeAction(couponId: string) {
  return async (_: State, formData: FormData): Promise<State> => {
    const email = formData.get('email') as string;
    if (!email?.trim()) return { error: '이메일을 입력해주세요.', success: false };

    try {
      await issueCouponToUserByEmail(couponId, email.trim());
      return { error: null, success: true };
    } catch (e) {
      return { error: e instanceof Error ? e.message : '발급 실패', success: false };
    }
  };
}

interface Props {
  couponId: string;
}

export function IssueForm({ couponId }: Props) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(makeAction(couponId), {
    error: null,
    success: false,
  });

  if (state.success) {
    router.refresh();
  }

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
          회원 이메일
        </label>
        <input
          type="email"
          name="email"
          required
          placeholder="user@example.com"
          className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {state.error && (
        <p className="text-xs text-red-600">{state.error}</p>
      )}
      {state.success && (
        <p className="text-xs text-green-700">쿠폰이 발급되었습니다.</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
      >
        {isPending ? '발급 중...' : '발급'}
      </button>
    </form>
  );
}
