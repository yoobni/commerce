'use client';

import { useTransition } from 'react';
import type { UserStatus } from '@commerce/types';
import { suspendMember, activateMember } from '@/lib/actions/members';

interface MemberStatusActionsProps {
  userId: string;
  currentStatus: UserStatus;
}

export default function MemberStatusActions({ userId, currentStatus }: MemberStatusActionsProps) {
  const [isPending, startTransition] = useTransition();

  if (currentStatus === 'WITHDRAWN') {
    return (
      <p className="text-sm text-[var(--color-text-tertiary)]">탈퇴 회원은 상태 변경이 불가합니다.</p>
    );
  }

  function handleSuspend() {
    if (!confirm('이 회원을 정지하시겠습니까? 로그인이 차단됩니다.')) return;
    startTransition(async () => {
      try {
        await suspendMember(userId);
      } catch (err) {
        alert(err instanceof Error ? err.message : '정지 처리에 실패했습니다.');
      }
    });
  }

  function handleActivate() {
    if (!confirm('이 회원의 정지를 해제하시겠습니까?')) return;
    startTransition(async () => {
      try {
        await activateMember(userId);
      } catch (err) {
        alert(err instanceof Error ? err.message : '활성화에 실패했습니다.');
      }
    });
  }

  return (
    <div className="flex gap-2">
      {currentStatus === 'ACTIVE' && (
        <button
          onClick={handleSuspend}
          disabled={isPending}
          className="px-4 py-1.5 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
        >
          {isPending ? '처리 중...' : '계정 정지'}
        </button>
      )}
      {currentStatus === 'SUSPENDED' && (
        <button
          onClick={handleActivate}
          disabled={isPending}
          className="px-4 py-1.5 text-sm bg-[var(--color-sidebar)] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? '처리 중...' : '정지 해제'}
        </button>
      )}
    </div>
  );
}
