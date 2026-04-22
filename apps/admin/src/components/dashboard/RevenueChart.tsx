'use client';

import type { DailyRevenue } from '@/lib/queries/dashboard';

function formatK(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

function formatKRW(n: number): string {
  return `₩${n.toLocaleString('ko-KR')}`;
}

interface RevenueChartProps {
  data: DailyRevenue[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const max = Math.max(...data.map((d) => d.amount), 1);
  const W = 560;
  const H = 120;
  const PADX = 44;
  const PADY = 8;
  const barCount = data.length;
  const slotW = (W - PADX * 2) / barCount;
  const barW = Math.max(slotW * 0.65, 2);

  const yLabels = [0, max / 2, max];

  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
      <p className="text-sm font-medium text-[var(--color-text-primary)] mb-4">
        매출 추이 (최근 30일, KRW)
      </p>
      <svg
        viewBox={`0 0 ${W} ${H + PADY + 28}`}
        className="w-full overflow-visible"
        role="img"
        aria-label="최근 30일 일별 매출 바 차트"
      >
        {/* Y-axis grid lines + labels */}
        {yLabels.map((val, i) => {
          const y = PADY + H - (val / max) * H;
          return (
            <g key={i}>
              <line
                x1={PADX}
                y1={y}
                x2={W - PADX}
                y2={y}
                stroke="#f3f4f6"
                strokeWidth={1}
              />
              <text
                x={PADX - 6}
                y={y + 4}
                textAnchor="end"
                fontSize={9}
                fill="#9ca3af"
              >
                {formatK(val)}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const barH = Math.max((d.amount / max) * H, d.amount > 0 ? 2 : 0);
          const x = PADX + i * slotW + (slotW - barW) / 2;
          const y = PADY + H - barH;
          return (
            <g key={d.date}>
              <title>{`${d.date}: ${formatKRW(d.amount)}`}</title>
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                fill="var(--color-brand-accent, #c8a96e)"
                opacity={0.85}
                rx={2}
              />
            </g>
          );
        })}

        {/* X-axis baseline */}
        <line
          x1={PADX}
          y1={PADY + H}
          x2={W - PADX}
          y2={PADY + H}
          stroke="#e5e7eb"
          strokeWidth={1}
        />

        {/* X-axis labels every 5th day */}
        {data.map((d, i) => {
          if (i % 5 !== 0) return null;
          const x = PADX + i * slotW + slotW / 2;
          return (
            <text
              key={d.date}
              x={x}
              y={PADY + H + 16}
              textAnchor="middle"
              fontSize={9}
              fill="#9ca3af"
            >
              {d.date.slice(5)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
