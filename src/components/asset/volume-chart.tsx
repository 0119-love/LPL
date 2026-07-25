"use client";

import { Bar, ComposedChart, ResponsiveContainer, XAxis } from "recharts";
import type { Candle } from "@/lib/yahoo/client";

export function VolumeChart({ candles }: { candles: Candle[] }) {
  return (
    <ResponsiveContainer width="100%" height={64}>
      <ComposedChart data={candles} syncId="asset-chart" margin={{ top: 0, right: 8, left: 8, bottom: 0 }}>
        <XAxis dataKey="time" hide />
        <Bar
          dataKey="volume"
          isAnimationActive={false}
          shape={(props: { x?: number; y?: number; width?: number; height?: number; payload?: Candle }) => {
            const { x, y, width, height, payload } = props;
            if (x == null || y == null || width == null || height == null || !payload) return <g />;
            const positive = payload.close >= payload.open;
            return (
              <rect
                x={x}
                y={y}
                width={Math.max(width, 1)}
                height={height}
                fill={positive ? "var(--accent-buy)" : "var(--accent-nobuy)"}
                opacity={0.35}
              />
            );
          }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
