'use client';

import { useActionState } from 'react';
import { updateShipmentStatus, setReturnTracking } from '@/lib/actions/shipments';
import type { ShipmentStatus } from '@commerce/types';

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

function statusAction(
  _: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const shipmentId = formData.get('shipmentId') as string;
  const newStatus = formData.get('newStatus') as ShipmentStatus;
  return updateShipmentStatus(shipmentId, newStatus)
    .then(() => ({ error: null }))
    .catch((e: unknown) => ({
      error: e instanceof Error ? e.message : '처리 중 오류가 발생했습니다.',
    }));
}

function returnAction(
  _: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const shipmentId = formData.get('shipmentId') as string;
  const returnNumber = formData.get('returnTrackingNumber') as string;
  return setReturnTracking(shipmentId, returnNumber)
    .then(() => ({ error: null }))
    .catch((e: unknown) => ({
      error: e instanceof Error ? e.message : '처리 중 오류가 발생했습니다.',
    }));
}

export function ShipmentStatusUpdater({ shipmentId, currentStatus }: Props) {
  const [statusState, statusFormAction, statusPending] = useActionState(statusAction, {
    error: null,
  });
  const [returnState, returnFormAction, returnPending] = useActionState(returnAction, {
    error: null,
  });

  const nextOptions = NEXT_STATUSES[currentStatus] ?? [];

  return (
    <div className="space-y-4">
      {nextOptions.length > 0 ? (
        <form action={statusFormAction} className="space-y-3">
          <input type="hidden" name="shipmentId" value={shipmentId} />
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
              상태 변경
            </label>
            <select
              name="newStatus"
              className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {nextOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          {statusState.error && (
            <p className="text-xs text-[var(--color-error)]">{statusState.error}</p>
          )}
          <button
            type="submit"
            disabled={statusPending}
            className="w-full py-2 text-sm font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-60 transition-colors"
          >
            {statusPending ? '처리 중...' : '상태 업데이트'}
          </button>
        </form>
      ) : (
        <p className="text-sm text-[var(--color-text-tertiary)]">더 이상 변경할 상태가 없습니다.</p>
      )}

      {/* Return tracking */}
      <form action={returnFormAction} className="space-y-2 pt-4 border-t border-[var(--color-border)]">
        <input type="hidden" name="shipmentId" value={shipmentId} />
        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
          반송 운송장 번호
        </label>
        <input
          type="text"
          name="returnTrackingNumber"
          placeholder="반송 운송장 번호 (선택)"
          className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {returnState.error && (
          <p className="text-xs text-[var(--color-error)]">{returnState.error}</p>
        )}
        <button
          type="submit"
          disabled={returnPending}
          className="w-full py-2 text-sm font-medium border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg hover:bg-gray-50 disabled:opacity-60 transition-colors"
        >
          {returnPending ? '저장 중...' : '반송 운송장 저장'}
        </button>
      </form>
    </div>
  );
}
