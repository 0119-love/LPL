"use client";

import { Area, AreaChart, Tooltip, XAxis, YAxis } from "recharts";
import { Panel } from "../ui/panel";
import { ChartPanel } from "../ui/chart-panel";
import { Metric } from "../ui/metric";
import { Link } from "@/i18n/navigation";
import { useUser } from "@/lib/supabase/use-user";
import { usePortfolioSnapshots } from "@/lib/queries/portfolio-queries";
import { computePortfolioStats } from "@/lib/terminal/derive";

export function PerformanceSection() {
  const { user, loading: userLoading } = useUser();
  const { data: snapshots } = usePortfolioSnapshots();
  const hasSeries = !!snapshots && snapshots.length >= 2;
  const stats = computePortfolioStats(snapshots ?? []);

  const values = hasSeries ? snapshots!.map((s) => s.totalValue) : [];
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const pad = (max - min) * 0.1 || max * 0.05 || 1;

  return (
    <Panel id="section-performance" eyebrow="Performance" meta={user ? "Live" : undefined} noPadding>
      {!userLoading && !user && (
        <div className="px-4 py-6 text-center">
          <p className="text-[12px] text-[var(--term-text-dim)]">Log in to track your performance.</p>
          <Link href="/login" className="mt-2 inline-block text-[12px] font-medium text-[var(--term-buy)] hover:opacity-80">
            Log in
          </Link>
        </div>
      )}

      {user && !hasSeries && (
        <p className="px-4 py-6 text-center text-[12px] text-[var(--term-text-dim)]">
          Not enough daily snapshots yet — check back after a few days of activity.
        </p>
      )}

      {user && hasSeries && (
        <>
          <ChartPanel height={180} className="px-2 pt-3">
            <AreaChart data={snapshots} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="perf-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--term-buy)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--term-buy)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickFormatter={(d: string) => new Date(d).toLocaleDateString([], { month: "short", day: "numeric" })}
                stroke="var(--term-text-dim)"
                tick={{ fontSize: 10 }}
                minTickGap={40}
              />
              <YAxis domain={[min - pad, max + pad]} hide />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0].payload as { date: string; totalValue: number };
                  return (
                    <div className="term-panel rounded-md px-3 py-2 text-[11px]">
                      <p className="text-[var(--term-text-dim)]">{new Date(p.date).toLocaleDateString()}</p>
                      <p className="term-mono font-medium">${p.totalValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
                    </div>
                  );
                }}
              />
              <Area type="monotone" dataKey="totalValue" stroke="var(--term-buy)" strokeWidth={1.5} fill="url(#perf-fill)" isAnimationActive={false} />
            </AreaChart>
          </ChartPanel>

          <div className="grid grid-cols-3 gap-4 border-t border-[var(--term-border)] px-4 py-4">
            <Metric label="Risk Score" value={stats.riskScore} unit="/100" size="sm" tone="amber" />
            <Metric label="Sharpe Ratio" value={stats.sharpeRatio.toFixed(2)} size="sm" tone="buy" />
            <Metric label="Max Drawdown" value={`${stats.maxDrawdownPct.toFixed(2)}%`} size="sm" tone="nobuy" />
          </div>
        </>
      )}
    </Panel>
  );
}
