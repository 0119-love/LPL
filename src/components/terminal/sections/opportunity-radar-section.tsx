"use client";

import { Panel } from "../ui/panel";
import { OpportunityRow } from "../ui/opportunity-row";
import { useQuotes } from "@/lib/queries/market-queries";
import { useSparklines } from "@/lib/queries/terminal-queries";
import { opportunities as fallbackOpportunities } from "@/lib/terminal/mock-data";

const TICKERS = fallbackOpportunities.map((o) => o.ticker);

// No real "opportunity scoring" engine exists — the score is derived from
// real momentum (today's % change) rather than invented outright.
function scoreFromChange(changePct: number) {
  return Math.max(1, Math.min(99, Math.round(60 + changePct * 6)));
}

export function OpportunityRadarSection() {
  const { data: quotes, isPending } = useQuotes(TICKERS);
  const sparklines = useSparklines(TICKERS, "1M");

  return (
    <Panel eyebrow="Opportunity Radar" meta={isPending ? "Loading…" : `Top ${fallbackOpportunities.length}`} noPadding>
      <div className="divide-y divide-[var(--term-border)]">
        {fallbackOpportunities.map((fallback) => {
          const q = quotes?.[fallback.ticker];
          const changePct = q?.dp ?? fallback.changePct;
          const spark = sparklines[fallback.ticker] ?? fallback.spark;
          return (
            <OpportunityRow
              key={fallback.ticker}
              rank={fallback.rank}
              ticker={fallback.ticker}
              name={fallback.name}
              tags={fallback.tags}
              score={q ? scoreFromChange(changePct) : fallback.score}
              changePct={changePct}
              spark={spark}
            />
          );
        })}
      </div>
    </Panel>
  );
}
