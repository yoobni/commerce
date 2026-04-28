/**
 * MiniChart — lightweight SVG sparkline (no external dependency).
 *
 * Design guide:
 *   <MiniChart data={[100, 120, 90, 140, 130, 160]} color="#3b82f6" />
 *
 * Props:
 *   data        — array of numeric values (min 2 points)
 *   width/height — SVG canvas size in px
 *   color       — stroke & fill color (hex / CSS variable)
 *   showArea    — fill below the line (default true)
 */

interface MiniChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showArea?: boolean;
  className?: string;
}

export function MiniChart({
  data,
  width = 120,
  height = 40,
  color = '#3b82f6',
  showArea = true,
  className,
}: MiniChartProps) {
  if (!data || data.length < 2) return null;

  const pad = 2;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const toX = (i: number) => pad + (i / (data.length - 1)) * (width - pad * 2);
  const toY = (v: number) => height - pad - ((v - min) / range) * (height - pad * 2);

  const linePts = data.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
  const areaPts = `${pad},${height - pad} ${linePts} ${width - pad},${height - pad}`;

  const lastX = toX(data.length - 1);
  const lastY = toY(data[data.length - 1]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
      role="img"
    >
      {showArea && <polygon points={areaPts} fill={color} fillOpacity={0.12} />}
      <polyline
        points={linePts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r="2.5" fill={color} />
    </svg>
  );
}
