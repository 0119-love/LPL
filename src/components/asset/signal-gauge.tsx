import type { ReactNode } from "react";
import type { Verdict } from "@/lib/asset/technical-analysis";

const VERDICT_COLOR: Record<Verdict, string> = {
  strong_sell: "var(--accent-nobuy)",
  sell: "rgba(255, 138, 76, 0.55)",
  neutral: "var(--foreground-muted)",
  buy: "rgba(61, 220, 132, 0.55)",
  strong_buy: "var(--accent-buy)",
};

const ZONE_ORDER: Verdict[] = ["strong_sell", "sell", "neutral", "buy", "strong_buy"];

export function SignalGauge({
  value,
  verdict,
  size = 140,
  label,
}: {
  value: number; // 0..100
  verdict: Verdict;
  size?: number;
  label?: ReactNode;
}) {
  const stops = ZONE_ORDER.map((v, i) => `${VERDICT_COLOR[v]} ${i * 36}deg ${(i + 1) * 36}deg`).join(", ");
  const pct = Math.max(0, Math.min(1, value / 100));
  const needleDeg = -90 + pct * 180;

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <div className="relative overflow-hidden" style={{ width: size, height: size / 2 }}>
        {/* Masked (not solid-filled) so the ring blends with whatever sits
            behind it — including the blurred glass card — instead of
            punching an opaque, mismatched-color hole in the middle. */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from -90deg, ${stops})`,
            WebkitMaskImage: "radial-gradient(circle at 50% 100%, transparent 0 62%, black 62% 100%)",
            maskImage: "radial-gradient(circle at 50% 100%, transparent 0 62%, black 62% 100%)",
          }}
        />
        <div
          className="absolute bottom-0 left-1/2 origin-bottom rounded-full"
          style={{
            width: 2,
            height: size * 0.4,
            background: VERDICT_COLOR[verdict],
            transform: `translateX(-50%) rotate(${needleDeg}deg)`,
          }}
        />
        <div
          className="absolute bottom-0 left-1/2 rounded-full"
          style={{ width: 7, height: 7, background: VERDICT_COLOR[verdict], transform: "translate(-50%, 50%)" }}
        />
      </div>
      {label != null && <div className="mt-2 text-center">{label}</div>}
    </div>
  );
}
