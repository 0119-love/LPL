"use client";

import { useQuotes } from "@/lib/queries/market-queries";
import { marketMovers as fallbackMovers } from "@/lib/terminal/mock-data";

const TICKERS = fallbackMovers.map((m) => m.ticker);

export function MarketMoversSection() {
  const { data: quotes, isPending } = useQuotes(TICKERS);

  const items = fallbackMovers.map((fallback) => {
    const q = quotes?.[fallback.ticker];
    return {
      ticker: fallback.ticker,
      price: q?.c ?? fallback.price,
      changePct: q?.dp ?? fallback.changePct,
      isLive: !isPending && !!q,
    };
  });

  const renderItems = (copy: "a" | "b") =>
    items.map((item) => {
      const positive = item.changePct >= 0;
      return (
        <span key={`${copy}-${item.ticker}`} className="flex shrink-0 items-baseline gap-2 pr-8 text-[12px]">
          <span className="font-semibold">{item.ticker}</span>
          <span className="term-mono text-[var(--term-text-mid)]">
            {item.isLive ? item.price.toFixed(2) : "—"}
          </span>
          <span className={`term-mono font-medium ${positive ? "text-[var(--term-buy)]" : "text-[var(--term-nobuy)]"}`}>
            {positive ? "+" : ""}
            {item.changePct.toFixed(2)}%
          </span>
        </span>
      );
    });

  return (
    <div className="shrink-0 flex items-center gap-4 border-t border-[var(--term-border)] bg-[var(--term-panel)] px-4 py-2.5">
      <span className="term-eyebrow shrink-0">Market Movers</span>
      <div className="relative flex-1 overflow-hidden">
        {/* Content is duplicated so the marquee loop has no visible seam. */}
        <div className="flex w-max items-center term-ticker-track">
          {renderItems("a")}
          {renderItems("b")}
        </div>
      </div>
    </div>
  );
}
