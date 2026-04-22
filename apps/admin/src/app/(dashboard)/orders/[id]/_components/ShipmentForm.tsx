'use client';

import { useActionState } from 'react';
import { startShipment } from '@/lib/actions/orders';
import type { Carrier, Country } from '@commerce/types';

interface Props {
  orderId: string;
  country: Country;
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

function shipmentAction(
  _: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const orderId = formData.get('orderId') as string;
  const carrier = formData.get('carrier') as Carrier;
  const trackingNumber = formData.get('trackingNumber') as string;
  const country = formData.get('country') as string;

  return startShipment({ orderId, carrier, trackingNumber, country })
    .then(() => ({ error: null }))
    .catch((e: unknown) => ({
      error: e instanceof Error ? e.message : '처리 중 오류가 발생했습니다.',
    }));
}

export function ShipmentForm({ orderId, country }: Props) {
  const [state, formAction, pending] = useActionState(shipmentAction, { error: null });

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="country" value={country} />

      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
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
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
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

      {state.error && (
        <p className="text-xs text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-2 text-sm font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-60 transition-colors"
      >
        {pending ? '처리 중...' : '배송 처리'}
      </button>
    </form>
  );
}
