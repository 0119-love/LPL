"use client";

import { Panel } from "../ui/panel";
import { Gauge } from "../ui/gauge";
import { useYahooQuotes } from "@/lib/queries/terminal-queries";
import { useQuotes } from "@/lib/queries/market-queries";
import { marketRegime as fallback, marketMovers } from "@/lib/terminal/mock-data";

const BREADTH_TICKERS = marketMovers.map((m) => m.ticker);

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function MarketRegimeSection() {
  const { data: indexQuotes } = useYahooQuotes(["^GSPC", "^VIX"]);
  const { data: moverQuotes } = useQuotes(BREADTH_TICKERS);

  const spx = indexQuotes?.["^GSPC"];
  const vix = indexQuotes?.["^VIX"];
  const hasLive = !!spx && !!vix && !!moverQuotes;

  let score = fallback.score;
  let label = fallback.label;
  let caption = fallback.caption;
  let breakdown = fallback.breakdown;

  if (hasLive && spx?.changePercent != null && vix?.price != null && moverQuotes) {
    const momentum = Math.round(clamp(50 + spx.changePercent * 10, 0, 100));
    const volatility = Math.round(vix.price);
    const positiveMovers = BREADTH_TICKERS.filter((t) => (moverQuotes[t]?.dp ?? 0) > 0).length;
    const breadth = Math.round((positiveMovers / BREADTH_TICKERS.length) * 100);
    const volatilityScore = clamp(vix.price * 2, 0, 100);

    score = Math.round(clamp(momentum * 0.5 + (100 - volatilityScore) * 0.3 + breadth * 0.2, 0, 100));
    label = score >= 60 ? "RISK-ON" : score <= 40 ? "RISK-OFF" : "NEUTRAL";
    caption = `Derived from real S&P 500 momentum, VIX level, and breadth across ${BREADTH_TICKERS.length} tracked names.`;
    breakdown = [
      { label: "Momentum", value: momentum, note: momentum >= 60 ? "Bullish" : momentum <= 40 ? "Bearish" : "Neutral" },
      { label: "Liquidity", value: fallback.breakdown[1].value, note: fallback.breakdown[1].note },
      { label: "Volatility", value: volatility, note: volatility < 20 ? "Low" : volatility < 30 ? "Moderate" : "High" },
      { label: "Breadth", value: breadth, note: breadth >= 60 ? "Bullish" : breadth <= 40 ? "Bearish" : "Neutral" },
    ];
  }

  const labelTone = label === "RISK-ON" ? "var(--term-buy)" : label === "RISK-OFF" ? "var(--term-nobuy)" : "var(--term-amber)";

  return (
    <Panel eyebrow="Market Regime" meta={hasLive ? "Risk Appetite · Live" : "Risk Appetite"} bodyClassName="flex flex-col items-center">
      <Gauge
        value={score}
        max={fallback.maxScore}
        size={180}
        zones={[
          { color: "var(--term-buy)", to: fallback.maxScore * 0.45 },
          { color: "var(--term-amber)", to: fallback.maxScore * 0.75 },
          { color: "var(--term-nobuy)", to: fallback.maxScore },
        ]}
        valueLabel={
          <>
            <p className="text-2xl font-bold tracking-tight" style={{ color: labelTone }}>
              {label}
            </p>
            <p className="term-mono mt-1 text-base font-semibold text-[var(--term-text)]">
              {score}
              <span className="text-[var(--term-text-dim)]">/{fallback.maxScore}</span>
            </p>
          </>
        }
        caption={caption}
      />

      <div className="mt-5 grid w-full grid-cols-2 gap-3 border-t border-[var(--term-border)] pt-4">
        {breakdown.map((stat) => (
          <div key={stat.label}>
            <p className="term-eyebrow">{stat.label}</p>
            <p className="term-mono mt-1 text-[13px] font-semibold">
              {stat.value} <span className="text-[11px] font-normal text-[var(--term-text-dim)]">{stat.note}</span>
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
