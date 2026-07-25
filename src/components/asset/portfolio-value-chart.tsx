"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Snapshot } from "@/lib/supabase/portfolio";

export function PortfolioValueChart({ snapshots }: { snapshots: Snapshot[] }) {
  if (snapshots.length < 2) {
    return null;
  }

  const values = snapshots.map((s) => s.totalValue);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.1 || max * 0.05 || 1;

  return (
    <ResponsiveContainer width="100%" height={140}>
      <AreaChart data={snapshots} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="portfolioFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-buy)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--accent-buy)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tickFormatter={(d: string) => new Date(d).toLocaleDateString([], { month: "short", day: "numeric" })}
          stroke="var(--foreground-muted)"
          tick={{ fontSize: 11 }}
          minTickGap={40}
        />
        <YAxis domain={[min - pad, max + pad]} hide />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0].payload as Snapshot;
            return (
              <div className="glass-card-strong rounded-lg px-3 py-2 text-xs">
                <p className="text-foreground-muted">
                  {new Date(p.date).toLocaleDateString()}
                </p>
                <p className="tabular-nums">${p.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
            );
          }}
        />
        <Area
          type="monotone"
          dataKey="totalValue"
          stroke="var(--accent-buy)"
          strokeWidth={1.5}
          fill="url(#portfolioFill)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
