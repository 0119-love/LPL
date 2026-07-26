"use client";

import { Panel } from "../ui/panel";
import { Metric } from "../ui/metric";
import { Sparkline } from "../ui/sparkline";
import { toneForChange } from "../ui/tone";
import { useUser } from "@/lib/supabase/use-user";
import { usePortfolioHoldings, usePortfolioSnapshots } from "@/lib/queries/portfolio-queries";
import { useQuotes } from "@/lib/queries/market-queries";
import { computePortfolioStats } from "@/lib/terminal/derive";
import { portfolioPulse as fallback } from "@/lib/terminal/mock-data";

function riskLabel(score: number) {
  if (score < 33) return "Low";
  if (score < 66) return "Moderate";
  return "High";
}
function sharpeLabel(ratio: number) {
  if (ratio >= 1) return "Good";
  if (ratio >= 0) return "Fair";
  return "Weak";
}
function drawdownLabel(pct: number) {
  return pct >= -10 ? "Acceptable" : "Elevated";
}

export function PortfolioPulseSection() {
  const { user, loading: userLoading } = useUser();
  const { data: holdings } = usePortfolioHoldings();
  const { data: snapshots } = usePortfolioSnapshots();
  const tickers = holdings?.map((h) => h.ticker) ?? [];
  const { data: quotes } = useQuotes(tickers);

  const isLoggedIn = !userLoading && !!user;
  const hasHoldings = isLoggedIn && !!holdings && !!quotes && holdings.length > 0;

  let totalValue = fallback.totalValue;
  let changePct = fallback.changePct;
  let spark = fallback.spark;
  let secondaryLabel = "Cash Position";
  let secondaryValue = `${fallback.cashPct.toFixed(1)}%`;
  let secondarySub = `$${fallback.cashPosition.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  let metaLabel = isLoggedIn ? "No holdings yet" : "Sample data";
  let stats = {
    riskScore: fallback.riskScore,
    sharpeRatio: fallback.sharpeRatio,
    maxDrawdownPct: fallback.maxDrawdownPct,
    hasEnoughHistory: true,
  };

  if (hasHoldings && holdings && quotes) {
    const totalCost = holdings.reduce((s, h) => s + h.quantity * h.avgCost, 0);
    totalValue = holdings.reduce((s, h) => s + h.quantity * (quotes[h.ticker]?.c ?? h.avgCost), 0);
    changePct = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;
    spark = snapshots && snapshots.length > 1 ? snapshots.map((s) => s.totalValue) : fallback.spark;

    const real = computePortfolioStats(snapshots ?? []);
    if (real.hasEnoughHistory) stats = real;
    else stats = { ...stats, hasEnoughHistory: false };

    metaLabel = "Live";
    secondaryLabel = "Holdings";
    secondaryValue = String(holdings.length);
    secondarySub = holdings.length === 1 ? "position" : "positions";
  }

  const tone = toneForChange(changePct);

  return (
    <Panel eyebrow="Portfolio Pulse" meta={metaLabel}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="term-eyebrow">Total Value</p>
          <p className="term-mono mt-1 text-2xl font-bold">
            ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className={`term-mono text-[12px] font-medium ${tone === "buy" ? "text-[var(--term-buy)]" : "text-[var(--term-nobuy)]"}`}>
            {changePct >= 0 ? "+" : ""}
            {changePct.toFixed(2)}%
          </p>
        </div>
        <Sparkline data={spark} positive={changePct >= 0} width={100} height={36} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[var(--term-border)] pt-4">
        {stats.hasEnoughHistory ? (
          <>
            <Metric label="Risk Score" value={stats.riskScore} unit="/100" sublabel={riskLabel(stats.riskScore)} tone="amber" />
            <Metric label="Sharpe Ratio" value={stats.sharpeRatio.toFixed(2)} sublabel={sharpeLabel(stats.sharpeRatio)} tone="buy" />
            <Metric label="Max Drawdown" value={`${stats.maxDrawdownPct.toFixed(2)}%`} sublabel={drawdownLabel(stats.maxDrawdownPct)} tone="nobuy" />
          </>
        ) : (
          <p className="col-span-2 text-[11px] leading-relaxed text-[var(--term-text-dim)]">
            {hasHoldings
              ? "Not enough daily snapshots yet to compute risk metrics — check back after a few days of activity."
              : "Sample risk metrics — connect a portfolio to see your own."}
          </p>
        )}
        <Metric label={secondaryLabel} value={secondaryValue} sublabel={secondarySub} />
      </div>
    </Panel>
  );
}
