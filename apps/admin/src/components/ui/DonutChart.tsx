interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  size?: number;
  thickness?: number;
}

export function DonutChart({ data, size = 120, thickness = 22 }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center text-xs text-[var(--color-text-tertiary)]" style={{ height: size }}>
        데이터 없음
      </div>
    );
  }

  const cx = size / 2;
  const cy = size / 2;
  const R = (size - thickness) / 2;
  const r = R - thickness;

  let cumulativePct = 0;
  const GAP = 0.015; // radians gap between segments

  const segments = data
    .filter((d) => d.value > 0)
    .map((d) => {
      const pct = d.value / total;
      const startAngle = cumulativePct * 2 * Math.PI - Math.PI / 2;
      cumulativePct += pct;
      const endAngle = cumulativePct * 2 * Math.PI - Math.PI / 2;

      const s = startAngle + GAP / 2;
      const e = endAngle - GAP / 2;

      const x1 = cx + R * Math.cos(s);
      const y1 = cy + R * Math.sin(s);
      const x2 = cx + R * Math.cos(e);
      const y2 = cy + R * Math.sin(e);
      const ix1 = cx + r * Math.cos(s);
      const iy1 = cy + r * Math.sin(s);
      const ix2 = cx + r * Math.cos(e);
      const iy2 = cy + r * Math.sin(e);
      const large = pct > 0.5 ? 1 : 0;

      const path = `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L ${ix2.toFixed(2)} ${iy2.toFixed(2)} A ${r} ${r} 0 ${large} 0 ${ix1.toFixed(2)} ${iy1.toFixed(2)} Z`;

      return { ...d, path, pct };
    });

  return (
    <div className="flex items-center gap-5">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
        className="shrink-0"
      >
        {segments.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} />
        ))}
        <text
          x={cx}
          y={cy - 5}
          textAnchor="middle"
          fontSize="14"
          fontWeight="600"
          fill="var(--color-text-primary)"
        >
          {total.toLocaleString()}
        </text>
        <text
          x={cx}
          y={cy + 10}
          textAnchor="middle"
          fontSize="9"
          fill="var(--color-text-tertiary)"
        >
          총 주문
        </text>
      </svg>

      <div className="space-y-2 min-w-0">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs min-w-0">
            <span
              className="w-2 h-2 rounded-sm shrink-0"
              style={{ background: s.color }}
            />
            <span className="text-[var(--color-text-secondary)] truncate">{s.label}</span>
            <span className="font-medium text-[var(--color-text-primary)] ml-auto pl-2 shrink-0">
              {s.value}
            </span>
            <span className="text-[var(--color-text-tertiary)] shrink-0">
              ({(s.pct * 100).toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
