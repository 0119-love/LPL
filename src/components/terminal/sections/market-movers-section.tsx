"use client";

import { useQuotes } from "@/lib/queries/market-queries";
import { marketMovers as fallbackMovers } from "@/lib/terminal/mock-data";

const TICKERS = fallbackMovers.map((m) => m.ticker);

export function MarketMoversSection() {
  const { data: quotes, isPending } = useQuotes(TICKERS);

  return (
    <div className="term-panel rounded-lg flex items-center gap-6 overflow-x-auto px-4 py-2.5 term-scrollbar">
      <span className="term-eyebrow shrink-0">Market Movers</span>
      {fallbackMovers.map((fallback) => {
        const q = quotes?.[fallback.ticker];
        const price = q?.c ?? fallback.price;
        const changePct = q?.dp ?? fallback.changePct;
        const positive = changePct >= 0;
        return (
          <span key={fallback.ticker} className="flex shrink-0 items-baseline gap-2 text-[12px]">
            <span className="font-semibold">{fallback.ticker}</span>
            <span className="term-mono text-[var(--term-text-mid)]">
              {isPending && !q ? "—" : price.toFixed(2)}
            </span>
            <span className={`term-mono font-medium ${positive ? "text-[var(--term-buy)]" : "text-[var(--term-nobuy)]"}`}>
              {positive ? "+" : ""}
              {changePct.toFixed(2)}%
            </span>
          </span>
        );
      })}
    </div>
  );
}
