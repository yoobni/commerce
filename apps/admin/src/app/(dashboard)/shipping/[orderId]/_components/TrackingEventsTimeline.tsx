import type { ShipmentTrackingEvent } from '@commerce/types';

interface TrackingEventsTimelineProps {
  events: ShipmentTrackingEvent[];
}

export function TrackingEventsTimeline({ events }: TrackingEventsTimelineProps) {
  if (!events.length) {
    return (
      <p className="text-sm text-[var(--color-text-tertiary)]">
        외부 추적 이벤트가 없습니다.
      </p>
    );
  }

  return (
    <ol className="relative space-y-4 pl-5 border-l-2 border-[var(--color-border)]">
      {events.map((ev, idx) => (
        <li key={idx} className="relative pl-4">
          <span className="absolute -left-[1.4rem] top-1.5 w-3 h-3 rounded-full bg-violet-500 border-2 border-white" />
          <p className="text-xs text-[var(--color-text-tertiary)] mb-0.5">
            {new Date(ev.occurred_at).toLocaleString('ko-KR')}
            {ev.location && (
              <span className="ml-2 font-medium text-[var(--color-text-secondary)]">
                {ev.location}
              </span>
            )}
          </p>
          <p className="text-sm text-[var(--color-text-primary)]">{ev.message ?? ev.status}</p>
        </li>
      ))}
    </ol>
  );
}
