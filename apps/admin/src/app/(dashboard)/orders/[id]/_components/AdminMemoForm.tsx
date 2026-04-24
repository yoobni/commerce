'use client';

import { useTransition, useRef } from 'react';
import { updateOrderAdminMemo } from '@/lib/actions/orders';

interface AdminMemoFormProps {
  orderId: string;
  initialMemo: string | null;
}

export default function AdminMemoForm({ orderId, initialMemo }: AdminMemoFormProps) {
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const memo = textareaRef.current?.value ?? '';
    startTransition(async () => {
      try {
        await updateOrderAdminMemo(orderId, memo);
      } catch (err) {
        alert(err instanceof Error ? err.message : '메모 저장에 실패했습니다.');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        ref={textareaRef}
        defaultValue={initialMemo ?? ''}
        rows={3}
        placeholder="내부 메모 (고객에게 노출되지 않음)"
        className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-1.5 text-sm bg-[var(--color-sidebar)] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? '저장 중...' : '메모 저장'}
      </button>
    </form>
  );
}
