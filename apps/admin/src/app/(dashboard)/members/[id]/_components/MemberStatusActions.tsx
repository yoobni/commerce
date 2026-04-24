'use client';

import { useTransition } from 'react';
import type { UserStatus } from '@commerce/types';
import { updateMemberStatus } from '@/lib/actions/members';
import { MEMBER_STATUS_LABEL } from '@/lib/queries/members';

const NEXT_STATUSES: Record<UserStatus, UserStatus[]> = {
  ACTIVE: ['SUSPENDED'],
  SUSPENDED: ['ACTIVE'],
  WITHDRAWN: [],
};

interface MemberStatusActionsProps {
  memberId: string;
  currentStatus: UserStatus;
}

export function MemberStatusActions({ memberId, currentStatus }: MemberStatusActionsProps) {
  const [isPending, startTransition] = useTransition();
  const nextStatuses = NEXT_STATUSES[currentStatus] ?? [];

  if (nextStatuses.length === 0) return null;

  const handleChange = (newStatus: UserStatus) => {
    const label = MEMBER_STATUS_LABEL[newStatus];
    if (!confirm(`회원 상태를 "${label}"(으)로 변경하시겠습니까?`)) return;

    startTransition(async () => {
      try {
        await updateMemberStatus(memberId, newStatus);
      } catch {
        alert('상태 변경에 실패했습니다.');
      }
    });
  };

  return (
    <div className="flex gap-2">
      {nextStatuses.map((next) => (
        <button
          key={next}
          onClick={() => handleChange(next)}
          disabled={isPending}
          className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors disabled:opacity-50 ${
            next === 'SUSPENDED'
              ? 'border border-red-300 text-red-600 hover:bg-red-50'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          {MEMBER_STATUS_LABEL[next]}으로 변경
        </button>
      ))}
    </div>
  );
}
