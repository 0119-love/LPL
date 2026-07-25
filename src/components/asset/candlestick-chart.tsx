"use client";

import {
  Bar,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Candle } from "@/lib/yahoo/client";

type CandleShapeProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: Candle;
};

function CandleShape(props: CandleShapeProps) {
  const { x, y, width, height, payload } = props;
  if (
    x == null ||
    y == null ||
    width == null ||
    height == null ||
    !payload
  ) {
    return null;
  }

  const { open, close, high, low } = payload;
  const range = high - low || 1;
  const pxPerUnit = height / range;

  const yOpen = y + height - (open - low) * pxPerUnit;
  const yClose = y + height - (close - low) * pxPerUnit;
  const bodyTop = Math.min(yOpen, yClose);
  const bodyHeight = Math.max(Math.abs(yClose - yOpen), 1);
  const positive = close >= open;
  const color = positive ? "var(--accent-buy)" : "var(--accent-nobuy)";
  const centerX = x + width / 2;
  const bodyWidth = Math.max(width * 0.6, 2);

  return (
    <g>
      <line x1={centerX} x2={centerX} y1={y} y2={y + height} stroke={color} strokeWidth={1} />
      <rect
        x={centerX - bodyWidth / 2}
        y={bodyTop}
        width={bodyWidth}
        height={bodyHeight}
        fill={color}
      />
    </g>
  );
}

function formatTime(ts: number, range: string) {
  const d = new Date(ts);
  if (range === "1D" || range === "1W") {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function TooltipContent({
  active,
  payload,
  range,
}: {
  active?: boolean;
  payload?: { payload: Candle }[];
  range: string;
}) {
  if (!active || !payload?.length) return null;
  const candle = payload[0].payload;

  return (
    <div className="glass-card-strong rounded-lg px-3 py-2 text-xs">
      <p className="text-foreground-muted">{formatTime(candle.time, range)}</p>
      <p>O <span className="tabular-nums">{candle.open.toFixed(2)}</span></p>
      <p>H <span className="tabular-nums">{candle.high.toFixed(2)}</span></p>
      <p>L <span className="tabular-nums">{candle.low.toFixed(2)}</span></p>
      <p>C <span className="tabular-nums">{candle.close.toFixed(2)}</span></p>
    </div>
  );
}

export function CandlestickChart({
  candles,
  range,
}: {
  candles: Candle[];
  range: string;
}) {
  const lows = candles.map((c) => c.low);
  const highs = candles.map((c) => c.high);
  const min = Math.min(...lows);
  const max = Math.max(...highs);
  const pad = (max - min) * 0.08 || 1;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={candles} syncId="asset-chart" margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
        <XAxis
          dataKey="time"
          tickFormatter={(t) => formatTime(t, range)}
          stroke="var(--foreground-muted)"
          tick={{ fontSize: 11 }}
          minTickGap={40}
        />
        <YAxis
          domain={[min - pad, max + pad]}
          orientation="right"
          stroke="var(--foreground-muted)"
          tick={{ fontSize: 11 }}
          width={56}
          tickFormatter={(v: number) => v.toFixed(0)}
        />
        <Tooltip content={<TooltipContent range={range} />} />
        <Bar dataKey={(d: Candle) => [d.low, d.high]} shape={CandleShape} isAnimationActive={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
