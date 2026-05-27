'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  toast,
} from '@/components/ui';
import { revokeCouponIssuance } from '@/lib/actions/coupons';

interface Props {
  issuanceId: string;
  couponId: string;
}

export function RevokeButton({ issuanceId, couponId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleRevoke() {
    startTransition(async () => {
      try {
        await revokeCouponIssuance(issuanceId, couponId);
        toast.success('쿠폰 발급을 취소했습니다.');
        setOpen(false);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : '취소 실패');
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={isPending}
        className="text-[12px] text-destructive hover:underline disabled:opacity-60"
      >
        {isPending ? '처리 중…' : '취소'}
      </button>

      <Dialog open={open} onOpenChange={(o) => !isPending && setOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>쿠폰 발급 취소</DialogTitle>
            <DialogDescription>
              해당 발급을 취소합니다. 회원의 쿠폰 목록에서 즉시 사라지며, 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              닫기
            </Button>
            <Button variant="destructive" onClick={handleRevoke} disabled={isPending}>
              {isPending ? '처리 중…' : '취소 확정'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
