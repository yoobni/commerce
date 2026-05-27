'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { CouponStatus } from '@commerce/types';
import {
  Badge,
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
import { COUPON_STATUS_LABEL, COUPON_STATUS_VARIANT } from '@/lib/queries/coupons';
import { updateCouponStatus } from '@/lib/actions/coupons';

const NEXT_STATUS: Partial<Record<CouponStatus, CouponStatus[]>> = {
  ACTIVE: ['PAUSED'],
  PAUSED: ['ACTIVE'],
};

const TRANSITION_VARIANT: Record<CouponStatus, ButtonProps['variant']> = {
  ACTIVE: 'accent',
  PAUSED: 'outline',
  EXPIRED: 'outline',
  DEPLETED: 'outline',
};

interface Props {
  couponId: string;
  currentStatus: CouponStatus;
}

export function CouponStatusActions({ couponId, currentStatus }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [target, setTarget] = useState<CouponStatus | null>(null);

  const nextStatuses = NEXT_STATUS[currentStatus] ?? [];

  function confirm(s: CouponStatus) {
    startTransition(async () => {
      try {
        await updateCouponStatus(couponId, s);
        toast.success(`상태를 "${COUPON_STATUS_LABEL[s]}"(으)로 변경했습니다.`);
        setTarget(null);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : '상태 변경에 실패했습니다.');
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">현재</span>
        <Badge variant={COUPON_STATUS_VARIANT[currentStatus]}>
          {COUPON_STATUS_LABEL[currentStatus]}
        </Badge>
      </div>

      {nextStatuses.length > 0 ? (
        <div className="flex flex-col gap-2">
          {nextStatuses.map((s) => (
            <Button
              key={s}
              variant={TRANSITION_VARIANT[s]}
              size="md"
              onClick={() => setTarget(s)}
              disabled={isPending}
              className="w-full"
            >
              {COUPON_STATUS_LABEL[s]}으로 변경
            </Button>
          ))}
        </div>
      ) : (
        <p className="text-[11.5px] text-muted-foreground">
          이 쿠폰은 더 이상 상태를 변경할 수 없습니다.
        </p>
      )}

      <Dialog open={target !== null} onOpenChange={(open) => !open && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>쿠폰 상태 변경</DialogTitle>
            <DialogDescription>
              쿠폰 상태를{' '}
              <strong className="text-foreground">
                {target ? COUPON_STATUS_LABEL[target] : ''}
              </strong>
              (으)로 변경합니다.
              {target === 'PAUSED' && ' 일시정지된 쿠폰은 사용할 수 없습니다.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTarget(null)} disabled={isPending}>
              취소
            </Button>
            <Button onClick={() => target && confirm(target)} disabled={isPending}>
              {isPending ? '처리 중…' : '확정'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
