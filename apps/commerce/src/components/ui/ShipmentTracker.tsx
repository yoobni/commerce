import { cn } from '@/lib/cn';
import type { Locale } from '@commerce/types';

interface ShipmentTrackerProps {
  orderStatus: string;
  carrier?: string | null;
  trackingNumber?: string | null;
  locale: Locale;
}

const ORDER_STATUS_TO_STEP: Record<string, number> = {
  PREPARING: 0,
  SHIPPED: 1,
  IN_TRANSIT: 2,
  OUT_FOR_DELIVERY: 2,
  DELIVERED: 3,
};

const CARRIER_LABELS: Record<string, string> = {
  CJ: 'CJ대한통운',
  HANJIN: '한진택배',
  LOGEN: '로젠택배',
  EMS: 'EMS',
  DHL: 'DHL',
  FEDEX: 'FedEx',
  UPS: 'UPS',
  USPS: 'USPS',
  YAMATO: 'ヤマト運輸',
  SAGAWA: '佐川急便',
};

type StepKey = 'ko' | 'en' | 'ja' | 'de';
type StepLabel = Record<StepKey, string>;

const STEPS: StepLabel[] = [
  { ko: '상품 준비', en: 'Preparing', ja: '準備中', de: 'Vorbereitung' },
  { ko: '배송 출발', en: 'Shipped', ja: '発送済み', de: 'Versandt' },
  { ko: '배송 중', en: 'In Transit', ja: '配送中', de: 'Im Transit' },
  { ko: '배달 완료', en: 'Delivered', ja: '配達完了', de: 'Zugestellt' },
];

const STRINGS: Record<StepKey, { noTracking: string; comingSoon: string; title: string }> = {
  ko: {
    noTracking: '송장번호 등록 후 조회 가능합니다',
    comingSoon: '추적 서비스 준비 중',
    title: '배송 단계',
  },
  en: {
    noTracking: 'Available after tracking number registration',
    comingSoon: 'Tracking coming soon',
    title: 'Shipping steps',
  },
  ja: {
    noTracking: '送り状番号登録後に追跡可能',
    comingSoon: '追跡サービス準備中',
    title: '配送ステップ',
  },
  de: {
    noTracking: 'Verfügbar nach Trackingnummer-Registrierung',
    comingSoon: 'Tracking in Kürze',
    title: 'Versandschritte',
  },
};

export function ShipmentTracker({
  orderStatus,
  carrier,
  trackingNumber,
  locale,
}: ShipmentTrackerProps) {
  const currentStep = ORDER_STATUS_TO_STEP[orderStatus] ?? -1;
  const s = STRINGS[locale as StepKey] ?? STRINGS.en;

  return (
    <div className="space-y-4">
      {/* Carrier + tracking number */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          {carrier && (
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-0.5">
              {CARRIER_LABELS[carrier] ?? carrier}
            </span>
          )}
          {trackingNumber ? (
            <p className="text-sm font-mono text-[var(--color-text-primary)]">{trackingNumber}</p>
          ) : (
            <p className="text-sm text-[var(--color-text-tertiary)] italic">{s.noTracking}</p>
          )}
        </div>
        <span className="flex-shrink-0 inline-flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full bg-[var(--color-neutral-100)] text-[var(--color-text-tertiary)]">
          <span
            className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"
            aria-hidden="true"
          />
          {s.comingSoon}
        </span>
      </div>

      {/* Status timeline */}
      <div className="flex items-start" role="list" aria-label={s.title}>
        {STEPS.map((step, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          const label = step[locale as StepKey] ?? step.en;

          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center relative"
              role="listitem"
            >
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'absolute top-3 left-1/2 right-0 h-0.5',
                    done || active
                      ? 'bg-[var(--color-brand-primary)]/30'
                      : 'bg-[var(--color-border)]'
                  )}
                  aria-hidden="true"
                />
              )}
              <div
                className={cn(
                  'relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold',
                  active
                    ? 'bg-[var(--color-brand-primary)] text-white ring-4 ring-[var(--color-brand-primary)]/15'
                    : done
                      ? 'bg-[var(--color-brand-primary)]/20 text-[var(--color-brand-primary)]'
                      : 'bg-[var(--color-neutral-100)] text-[var(--color-text-tertiary)]'
                )}
                aria-current={active ? 'step' : undefined}
              >
                {done ? '✓' : i + 1}
              </div>
              <p
                className={cn(
                  'text-[10px] mt-1.5 text-center leading-tight px-0.5',
                  active
                    ? 'font-semibold text-[var(--color-brand-primary)]'
                    : done
                      ? 'text-[var(--color-text-secondary)]'
                      : 'text-[var(--color-text-tertiary)]'
                )}
              >
                {label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
