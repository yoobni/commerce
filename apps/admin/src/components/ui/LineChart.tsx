interface LineChartDataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineChartDataPoint[];
  color?: string;
  height?: number;
  showArea?: boolean;
  formatValue?: (v: number) => string;
}

export function LineChart({
  data,
  color = '#3b82f6',
  height = 160,
  showArea = true,
  formatValue,
}: LineChartProps) {
  if (!data || data.length < 2) {
    return (
      <div
        className="flex items-center justify-center text-xs text-[var(--color-text-tertiary)]"
        style={{ height }}
      >
        데이터 없음
      </div>
    );
  }

  const W = 400;
  const padL = 8;
  const padR = 8;
  const padT = 8;
  const padB = 24;
  const cW = W - padL - padR;
  const cH = height - padT - padB;

  const values = data.map((d) => d.value);
  const max = Math.max(...values, 1);
  const min = 0;
  const range = max - min;

  const toX = (i: number) => padL + (i / (data.length - 1)) * cW;
  const toY = (v: number) => padT + cH - ((v - min) / range) * cH;

  const pts = data.map((d, i) => `${toX(i).toFixed(1)},${toY(d.value).toFixed(1)}`).join(' ');
  const areaPts = `${padL},${padT + cH} ${pts} ${toX(data.length - 1).toFixed(1)},${(padT + cH).toFixed(1)}`;

  // Show label every N points to avoid overlap (max ~7 labels)
  const step = Math.max(1, Math.ceil(data.length / 7));

  return (
    <svg
      viewBox={`0 0 ${W} ${height}`}
      className="w-full"
      style={{ height }}
      aria-hidden="true"
    >
      {/* Gridline at max */}
      <line
        x1={padL}
        y1={padT}
        x2={W - padR}
        y2={padT}
        stroke="#f0f0f0"
        strokeWidth="1"
      />
      {/* Baseline */}
      <line
        x1={padL}
        y1={padT + cH}
        x2={W - padR}
        y2={padT + cH}
        stroke="#e5e7eb"
        strokeWidth="1"
      />

      {/* Max label */}
      {formatValue && (
        <text
          x={padL}
          y={padT - 2}
          fontSize="9"
          fill="#9ca3af"
        >
          {formatValue(max)}
        </text>
      )}

      {/* Area */}
      {showArea && (
        <polygon points={areaPts} fill={color} fillOpacity={0.1} />
      )}

      {/* Line */}
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {data.map((d, i) => (
        <circle
          key={i}
          cx={toX(i)}
          cy={toY(d.value)}
          r={data.length <= 10 ? 2.5 : 1.5}
          fill={color}
        />
      ))}

      {/* X-axis labels */}
      {data.map((d, i) =>
        i % step === 0 || i === data.length - 1 ? (
          <text
            key={i}
            x={toX(i)}
            y={height - 4}
            textAnchor={i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'}
            fontSize="9"
            fill="#9ca3af"
          >
            {d.label}
          </text>
        ) : null
      )}
    </svg>
  );
}
