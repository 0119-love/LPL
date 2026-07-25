export function Sparkline({
  data,
  width = 160,
  height = 40,
  positive = true,
}: {
  data: number[];
  width?: number;
  height?: number;
  positive?: boolean;
}) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((value, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "var(--accent-buy)" : "var(--accent-nobuy)"}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
