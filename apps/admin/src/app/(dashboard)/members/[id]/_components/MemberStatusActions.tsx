'use client';

import { useState, useTransition } from 'react';
import type { UserStatus } from '@commerce/types';
import {
  Button,
  type ButtonProps,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  toast,
} from '@/components/ui';
import { MEMBER_STATUS_LABEL } from '@/lib/admin-ui/members-labels';
import { updateMemberStatus } from '@/lib/actions/members';

const NEXT_STATUSES: Record<UserStatus, UserStatus[]> = {
  ACTIVE: ['SUSPENDED'],
  SUSPENDED: ['ACTIVE'],
  WITHDRAWN: [],
};

const TRANSITION_VARIANT: Record<UserStatus, ButtonProps['variant']> = {
  ACTIVE: 'accent',
  SUSPENDED: 'destructive',
  WITHDRAWN: 'outline',
};

interface MemberStatusActionsProps {
  memberId: string;
  currentStatus: UserStatus;
}

export function MemberStatusActions({ memberId, currentStatus }: MemberStatusActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [target, setTarget] = useState<UserStatus | null>(null);
  const nextStatuses = NEXT_STATUSES[currentStatus] ?? [];

  if (nextStatuses.length === 0) {
    return (
      <p className="text-[12.5px] text-muted-foreground">
        현재 상태에서 변경 가능한 다음 단계가 없습니다.
      </p>
    );
  }

  const confirm = (newStatus: UserStatus) => {
    startTransition(async () => {
      try {
        await updateMemberStatus(memberId, newStatus);
        toast.success(`상태를 "${MEMBER_STATUS_LABEL[newStatus]}"(으)로 변경했습니다.`);
        setTarget(null);
      } catch {
        toast.error('상태 변경에 실패했습니다.');
      }
    });
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {nextStatuses.map((next) => (
          <Button
            key={next}
            variant={TRANSITION_VARIANT[next] ?? 'outline'}
            size="sm"
            onClick={() => setTarget(next)}
            disabled={isPending}
          >
            {MEMBER_STATUS_LABEL[next]}으로 변경
          </Button>
        ))}
      </div>

      <Dialog open={target !== null} onOpenChange={(open) => !open && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>회원 상태 변경</DialogTitle>
            <DialogDescription>
              회원 상태를{' '}
              <strong className="text-foreground">
                {target ? MEMBER_STATUS_LABEL[target] : ''}
              </strong>
              (으)로 변경합니다.
              {target === 'SUSPENDED' && ' 정지된 회원은 로그인할 수 없습니다.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTarget(null)} disabled={isPending}>
              취소
            </Button>
            <Button
              variant={target === 'SUSPENDED' ? 'destructive' : 'primary'}
              onClick={() => target && confirm(target)}
              disabled={isPending}
            >
              {isPending ? '처리 중…' : '확정'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
