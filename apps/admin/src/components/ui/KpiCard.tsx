/**
 * KpiCard — KPI metric card for the dashboard.
 *
 * Design guide:
 *   <KpiCard
 *     label="오늘 주문"
 *     value="142"
 *     trend={{ direction: 'up', text: '+12% 어제 대비' }}
 *     icon={<path d="..." />}
 *     iconBg="bg-blue-50"
 *     iconColor="text-blue-600"
 *     chart={<MiniChart data={[...]} color="#3b82f6" />}
 *   />
 */

import { cn } from '@/lib/cn';

interface KpiCardProps {
  label: string;
  value: string;
  subLabel?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    text: string;
  };
  /** SVG <path> d attribute for the icon */
  iconPath: string;
  iconBg?: string;
  iconColor?: string;
  chart?: React.ReactNode;
}

export function KpiCard({
  label,
  value,
  subLabel,
  trend,
  iconPath,
  iconBg = 'bg-blue-50',
  iconColor = 'text-blue-600',
  chart,
}: KpiCardProps) {
  return (
    <div className="bg-white border border-[var(--color-border)] rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wide">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-bold text-[var(--color-text-primary)] leading-none">
            {value}
          </p>
          {subLabel && <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{subLabel}</p>}
          {trend && (
            <div
              className={cn(
                'mt-2 inline-flex items-center gap-0.5 text-xs font-medium',
                trend.direction === 'up' && 'text-emerald-600',
                trend.direction === 'down' && 'text-red-500',
                trend.direction === 'neutral' && 'text-[var(--color-text-tertiary)]'
              )}
            >
              {trend.direction === 'up' && (
                <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" aria-hidden="true">
                  <path
                    d="M8 12V4M8 4l-3 3M8 4l3 3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              {trend.direction === 'down' && (
                <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" aria-hidden="true">
                  <path
                    d="M8 4v8M8 12l-3-3M8 12l3-3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              {trend.text}
            </div>
          )}
        </div>

        {/* Icon */}
        <div
          className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', iconBg)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('w-5 h-5', iconColor)}
            aria-hidden="true"
          >
            <path d={iconPath} />
          </svg>
        </div>
      </div>

      {/* Sparkline */}
      {chart && <div className="mt-auto">{chart}</div>}
    </div>
  );
}
