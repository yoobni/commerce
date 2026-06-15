'use client';

import { useState, useTransition } from 'react';
import type { OrderStatus } from '@commerce/types';
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
import { ORDER_STATUS_LABEL } from '@/lib/admin-ui/orders-labels';
import { updateOrderStatus } from '@/lib/actions/orders';

const ORDER_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING_PAYMENT: ['CANCELLED'],
  PAID: ['PREPARING', 'CANCELLED'],
  PREPARING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['CONFIRMED', 'RETURN_REQUESTED'],
  RETURN_REQUESTED: ['RETURNED', 'PREPARING'],
  RETURNED: ['REFUND_REQUESTED'],
  REFUND_REQUESTED: [],
  DELIVERY_FAILED: ['RETURN_REQUESTED', 'CANCELLED'],
};

const TRANSITION_VARIANT: Partial<Record<OrderStatus, ButtonProps['variant']>> = {
  PREPARING: 'primary',
  SHIPPED: 'primary',
  DELIVERED: 'accent',
  CONFIRMED: 'accent',
  RETURNED: 'outline',
  REFUND_REQUESTED: 'destructive',
  CANCELLED: 'destructive',
  RETURN_REQUESTED: 'outline',
};

interface OrderStatusActionsProps {
  orderId: string;
  currentStatus: OrderStatus;
}

export function OrderStatusActions({ orderId, currentStatus }: OrderStatusActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [target, setTarget] = useState<OrderStatus | null>(null);
  const nextStatuses = ORDER_TRANSITIONS[currentStatus] ?? [];

  if (nextStatuses.length === 0) {
    return (
      <p className="text-[12.5px] text-muted-foreground">
        현재 상태에서 변경 가능한 다음 단계가 없습니다.
      </p>
    );
  }

  const confirm = (newStatus: OrderStatus) => {
    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, newStatus);
        toast.success(`상태를 "${ORDER_STATUS_LABEL[newStatus]}"(으)로 변경했습니다.`);
        setTarget(null);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : '상태 변경에 실패했습니다.');
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
            {ORDER_STATUS_LABEL[next]}으로 변경
          </Button>
        ))}
      </div>

      <Dialog open={target !== null} onOpenChange={(open) => !open && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>상태 변경 확인</DialogTitle>
            <DialogDescription>
              주문 상태를 <strong className="text-foreground">{target ? ORDER_STATUS_LABEL[target] : ''}</strong>(으)로
              변경합니다. 이 작업은 즉시 반영됩니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTarget(null)} disabled={isPending}>
              취소
            </Button>
            <Button
              variant={target && TRANSITION_VARIANT[target] === 'destructive' ? 'destructive' : 'primary'}
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
