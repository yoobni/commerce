'use client';

import { useTransition } from 'react';
import { unsuspendMember } from '@/lib/actions/members';

interface Props {
  userId: string;
}

export function UnsuspendButton({ userId }: Props) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(() => {
      void unsuspendMember(userId).catch((e: unknown) => {
        alert(e instanceof Error ? e.message : '처리 중 오류가 발생했습니다.');
      });
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="w-full py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors"
    >
      {pending ? '처리 중...' : '정지 해제'}
    </button>
  );
}
