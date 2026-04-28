import type { Locale } from '@commerce/types';

interface ShipmentTrackerProps {
  orderStatus: string;
  carrier: string | null;
  trackingNumber: string | null;
  locale: Locale;
}

const STATUS_STEPS = ['PREPARING', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];

const STATUS_LABELS: Record<string, Record<Locale, string>> = {
  PREPARING: { ko: '상품 준비중', en: 'Preparing', ja: '準備中', de: 'In Vorbereitung' },
  SHIPPED: { ko: '배송 출발', en: 'Shipped', ja: '発送済み', de: 'Versandt' },
  IN_TRANSIT: { ko: '배송중', en: 'In Transit', ja: '配送中', de: 'Unterwegs' },
  OUT_FOR_DELIVERY: { ko: '배달중', en: 'Out for Delivery', ja: '配達中', de: 'Wird zugestellt' },
  DELIVERED: { ko: '배송 완료', en: 'Delivered', ja: '配達完了', de: 'Zugestellt' },
};

export function ShipmentTracker({ orderStatus, carrier, trackingNumber, locale }: ShipmentTrackerProps) {
  const currentIndex = STATUS_STEPS.indexOf(orderStatus);

  return (
    <div className="space-y-4">
      <ol className="flex items-center gap-0 w-full">
        {STATUS_STEPS.map((status, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          const label = STATUS_LABELS[status]?.[locale] ?? status;
          return (
            <li key={status} className="flex-1 flex flex-col items-center">
              <div className="flex items-center w-full">
                <div
                  className={`flex-1 h-0.5 ${i === 0 ? 'invisible' : done || active ? 'bg-[var(--color-brand-primary)]' : 'bg-[var(--color-neutral-200)]'}`}
                />
                <span
                  className={`w-3 h-3 rounded-full flex-shrink-0 ${active ? 'bg-[var(--color-brand-primary)] ring-4 ring-[var(--color-brand-primary)]/20' : done ? 'bg-[var(--color-brand-primary)]' : 'bg-[var(--color-neutral-200)]'}`}
                  aria-current={active ? 'step' : undefined}
                />
                <div
                  className={`flex-1 h-0.5 ${i === STATUS_STEPS.length - 1 ? 'invisible' : done ? 'bg-[var(--color-brand-primary)]' : 'bg-[var(--color-neutral-200)]'}`}
                />
              </div>
              <span className={`mt-2 text-[10px] text-center leading-tight ${active ? 'text-[var(--color-brand-primary)] font-semibold' : done ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text-tertiary)]'}`}>
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      {carrier && trackingNumber && (
        <p className="text-xs text-[var(--color-text-secondary)]">
          {carrier} · {trackingNumber}
        </p>
      )}
    </div>
  );
}
