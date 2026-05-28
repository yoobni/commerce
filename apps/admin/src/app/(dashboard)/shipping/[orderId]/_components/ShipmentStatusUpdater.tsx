'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from '@/components/ui';
import type { ShipmentStatus } from '@commerce/types';
import { updateShipmentStatus, setReturnTracking } from '@/lib/actions/shipments';

interface Props {
  shipmentId: string;
  currentStatus: ShipmentStatus;
}

const NEXT_STATUSES: Partial<Record<ShipmentStatus, { value: ShipmentStatus; label: string }[]>> = {
  PENDING: [{ value: 'PICKED_UP', label: '수거 완료' }],
  PICKED_UP: [{ value: 'IN_TRANSIT', label: '배송 중' }],
  IN_TRANSIT: [
    { value: 'CUSTOMS_HELD', label: '통관 보류' },
    { value: 'OUT_FOR_DELIVERY', label: '배달 중' },
  ],
  CUSTOMS_HELD: [
    { value: 'IN_TRANSIT', label: '배송 재개' },
    { value: 'OUT_FOR_DELIVERY', label: '배달 중' },
  ],
  OUT_FOR_DELIVERY: [
    { value: 'DELIVERED', label: '배달 완료' },
    { value: 'RETURNED', label: '반송' },
  ],
};

export function ShipmentStatusUpdater({ shipmentId, currentStatus }: Props) {
  const router = useRouter();
  const nextOptions = NEXT_STATUSES[currentStatus] ?? [];
  const [newStatus, setNewStatus] = useState<ShipmentStatus | ''>(nextOptions[0]?.value ?? '');
  const [returnNumber, setReturnNumber] = useState('');
  const [statusPending, statusTransition] = useTransition();
  const [returnPending, returnTransition] = useTransition();

  function handleStatusUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!newStatus) return;
    statusTransition(async () => {
      try {
        await updateShipmentStatus(shipmentId, newStatus as ShipmentStatus);
        toast.success('배송 상태를 변경했습니다.');
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : '처리 실패');
      }
    });
  }

  function handleReturnTracking(e: React.FormEvent) {
    e.preventDefault();
    if (!returnNumber.trim()) return;
    returnTransition(async () => {
      try {
        await setReturnTracking(shipmentId, returnNumber.trim());
        toast.success('반송 운송장을 저장했습니다.');
        setReturnNumber('');
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : '처리 실패');
      }
    });
  }

  return (
    <div className="space-y-4">
      {nextOptions.length > 0 ? (
        <form onSubmit={handleStatusUpdate} className="space-y-3">
          <div className="space-y-1.5">
            <Label>다음 상태</Label>
            <Select
              value={newStatus}
              onValueChange={(v) => setNewStatus(v as ShipmentStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {nextOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={statusPending || !newStatus} className="w-full" size="md">
            {statusPending ? '처리 중…' : '상태 업데이트'}
          </Button>
        </form>
      ) : (
        <p className="text-[12.5px] text-muted-foreground">더 이상 변경할 상태가 없습니다.</p>
      )}

      <form
        onSubmit={handleReturnTracking}
        className="space-y-2 border-t border-border pt-4"
      >
        <div className="space-y-1.5">
          <Label htmlFor="return-tracking">반송 운송장 번호</Label>
          <Input
            id="return-tracking"
            value={returnNumber}
            onChange={(e) => setReturnNumber(e.target.value)}
            placeholder="반송 운송장 번호 (선택)"
            disabled={returnPending}
            className="font-mono"
          />
        </div>
        <Button
          type="submit"
          variant="outline"
          disabled={returnPending || !returnNumber}
          className="w-full"
          size="md"
        >
          {returnPending ? '저장 중…' : '반송 운송장 저장'}
        </Button>
      </form>
    </div>
  );
}
