'use client';

import { useActionState } from 'react';
import { startShipment } from '@/lib/actions/shipments';
import type { Carrier } from '@commerce/types';

interface Props {
  orderId: string;
  country: string;
}

const CARRIER_OPTIONS: { value: Carrier; label: string }[] = [
  { value: 'CJ', label: 'CJ대한통운' },
  { value: 'HANJIN', label: '한진택배' },
  { value: 'LOGEN', label: '로젠택배' },
  { value: 'EMS', label: 'EMS' },
  { value: 'DHL', label: 'DHL' },
  { value: 'FEDEX', label: 'FedEx' },
  { value: 'UPS', label: 'UPS' },
  { value: 'USPS', label: 'USPS' },
  { value: 'YAMATO', label: '야마토' },
  { value: 'SAGAWA', label: '사가와' },
];

function action(
  _: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  return startShipment({
    orderId: formData.get('orderId') as string,
    carrier: formData.get('carrier') as Carrier,
    trackingNumber: formData.get('trackingNumber') as string,
    country: formData.get('country') as string,
  })
    .then(() => ({ error: null }))
    .catch((e: unknown) => ({
      error: e instanceof Error ? e.message : '처리 중 오류가 발생했습니다.',
    }));
}

export function ShipmentInputForm({ orderId, country }: Props) {
  const [state, formAction, pending] = useActionState(action, { error: null });

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="country" value={country} />

      <div>
        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
          택배사
        </label>
        <select
          name="carrier"
          required
          className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {CARRIER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
          운송장 번호
        </label>
        <input
          type="text"
          name="trackingNumber"
          required
          placeholder="운송장 번호 입력"
          className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {state.error && <p className="text-xs text-[var(--color-error)]">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-2 text-sm font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-60 transition-colors"
      >
        {pending ? '처리 중...' : '배송 처리 (PREPARING → SHIPPED)'}
      </button>
    </form>
  );
}
