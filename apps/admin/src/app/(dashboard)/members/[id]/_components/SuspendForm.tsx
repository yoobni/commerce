'use client';

import { useActionState } from 'react';
import { suspendMember } from '@/lib/actions/members';
import type { SanctionType } from '@/lib/queries/members';

interface Props {
  userId: string;
}

const SANCTION_OPTIONS: { value: SanctionType; label: string }[] = [
  { value: 'WARNING', label: '경고' },
  { value: 'SUSPEND_7D', label: '7일 정지' },
  { value: 'SUSPEND_30D', label: '30일 정지' },
  { value: 'PERMANENT_BAN', label: '영구 정지' },
];

function suspendAction(
  _: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const userId = formData.get('userId') as string;
  const type = formData.get('type') as SanctionType;
  const reason = formData.get('reason') as string;
  const endsAt = formData.get('endsAt') as string | null;

  return suspendMember({ userId, type, reason, endsAt: endsAt || null })
    .then(() => ({ error: null }))
    .catch((e: unknown) => ({
      error: e instanceof Error ? e.message : '처리 중 오류가 발생했습니다.',
    }));
}

export function SuspendForm({ userId }: Props) {
  const [state, formAction, pending] = useActionState(suspendAction, { error: null });

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="userId" value={userId} />

      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
          제재 유형
        </label>
        <select
          name="type"
          required
          className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {SANCTION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
          사유
        </label>
        <textarea
          name="reason"
          required
          rows={3}
          placeholder="제재 사유를 입력하세요"
          className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
          종료일 (비워두면 무기한)
        </label>
        <input
          type="datetime-local"
          name="endsAt"
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
        {pending ? '처리 중...' : '제재 적용'}
      </button>
    </form>
  );
}
