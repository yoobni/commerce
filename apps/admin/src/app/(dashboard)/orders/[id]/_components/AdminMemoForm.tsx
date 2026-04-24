'use client';

import { useTransition, useRef } from 'react';
import { updateOrderAdminMemo } from '@/lib/actions/orders';

interface AdminMemoFormProps {
  orderId: string;
  initialMemo: string | null;
}

export function AdminMemoForm({ orderId, initialMemo }: AdminMemoFormProps) {
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLTextAreaElement>(null);

  const handleSave = () => {
    const memo = ref.current?.value ?? '';
    startTransition(async () => {
      try {
        await updateOrderAdminMemo(orderId, memo);
      } catch {
        alert('저장에 실패했습니다.');
      }
    });
  };

  return (
    <div className="space-y-2">
      <label htmlFor="admin-memo" className="text-xs font-medium text-[var(--color-text-secondary)]">
        관리자 메모
      </label>
      <textarea
        id="admin-memo"
        ref={ref}
        defaultValue={initialMemo ?? ''}
        rows={3}
        placeholder="내부용 메모를 입력하세요. 고객에게 노출되지 않습니다."
        className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleSave}
        disabled={isPending}
        className="px-4 py-1.5 text-sm bg-[var(--color-sidebar)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isPending ? '저장 중…' : '메모 저장'}
      </button>
    </div>
  );
}
