import type { ReactNode } from "react";

export type GaugeZone = { color: string; to: number };

// Reusable semicircle "risk dial" gauge — zoned arc + needle. Used for
// Market Regime today; any other 0..max risk-style reading (e.g. a future
// per-asset risk score) can reuse it as-is.
export function Gauge({
  value,
  max = 100,
  size = 160,
  zones,
  valueLabel,
  caption,
}: {
  value: number;
  max?: number;
  size?: number;
  zones?: GaugeZone[];
  valueLabel?: ReactNode;
  caption?: ReactNode;
}) {
  const z: GaugeZone[] = zones ?? [
    { color: "var(--term-nobuy)", to: max * 0.33 },
    { color: "var(--term-text-dim)", to: max * 0.66 },
    { color: "var(--term-cyan)", to: max },
  ];

  let prevDeg = 0;
  const stops: string[] = [];
  for (const zone of z) {
    const deg = (Math.min(zone.to, max) / max) * 180;
    stops.push(`${zone.color} ${prevDeg}deg ${deg}deg`);
    prevDeg = deg;
  }
  stops.push(`transparent ${prevDeg}deg 360deg`);

  const pct = Math.max(0, Math.min(1, value / max));
  const needleDeg = -90 + pct * 180;

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <div className="relative overflow-hidden" style={{ width: size, height: size / 2 }}>
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: `conic-gradient(from -90deg, ${stops.join(", ")})` }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: size * 0.6,
            height: size * 0.6,
            left: "50%",
            bottom: 0,
            transform: "translate(-50%, 50%)",
            background: "var(--term-panel)",
          }}
        />
        <div
          className="absolute bottom-0 left-1/2 origin-bottom rounded-full"
          style={{
            width: 2,
            height: size * 0.42,
            background: "var(--term-text)",
            transform: `translateX(-50%) rotate(${needleDeg}deg)`,
          }}
        />
        <div
          className="absolute bottom-0 left-1/2 rounded-full"
          style={{
            width: 8,
            height: 8,
            background: "var(--term-text)",
            transform: "translate(-50%, 50%)",
          }}
        />
      </div>
      {valueLabel != null && <div className="mt-2 text-center">{valueLabel}</div>}
      {caption != null && <p className="mt-0.5 text-[10.5px] text-[var(--term-text-dim)]">{caption}</p>}
    </div>
  );
}
