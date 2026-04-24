'use client';

interface BarChartDataItem {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarChartDataItem[];
  color?: 'primary' | 'accent';
  height?: number;
}

export function BarChart({
  data,
  color = 'primary',
  height = 80,
}: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const barColor =
    color === 'accent'
      ? 'var(--color-chart-2)'
      : 'var(--color-chart-1)';

  return (
    <div
      className="flex items-end gap-1"
      style={{ height }}
      role="img"
      aria-label="막대 차트"
    >
      {data.map((d, i) => {
        const pct = Math.round((d.value / max) * 100);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t opacity-80 hover:opacity-100 transition-opacity"
              style={{
                height: `${Math.max(pct, 2)}%`,
                background: barColor,
              }}
              title={`${d.label}: ${d.value.toLocaleString()}`}
            />
            <span className="text-[9px] text-[var(--color-text-tertiary)] leading-none truncate w-full text-center">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
