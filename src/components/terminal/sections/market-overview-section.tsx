"use client";

import { Panel } from "../ui/panel";
import { Metric } from "../ui/metric";
import { Sparkline } from "../ui/sparkline";
import { toneForChange } from "../ui/tone";
import { useYahooQuotes, useSparklines } from "@/lib/queries/terminal-queries";
import { marketIndices as fallbackIndices } from "@/lib/terminal/mock-data";

const INDEX_META = [
  { symbol: "^GSPC", label: "S&P 500", format: (p: number) => p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
  { symbol: "^IXIC", label: "NASDAQ", format: (p: number) => p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
  { symbol: "^DJI", label: "DOW JONES", format: (p: number) => p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
  { symbol: "^VIX", label: "VIX", format: (p: number) => p.toFixed(2) },
  { symbol: "^TNX", label: "10Y YIELD", format: (p: number) => `${p.toFixed(2)}%` },
];

const SYMBOLS = INDEX_META.map((i) => i.symbol);

export function MarketOverviewSection() {
  const { data: quotes, isPending, isError } = useYahooQuotes(SYMBOLS);
  const sparklines = useSparklines(SYMBOLS, "1D");
  const isLive = !isPending && !isError && !!quotes;

  return (
    <Panel
      id="section-markets"
      eyebrow="Market Overview"
      meta={isLive ? "Live" : isPending ? "Loading…" : "Sample data"}
      noPadding
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5">
        {INDEX_META.map((idx, i) => {
          const fallback = fallbackIndices[i];
          const q = quotes?.[idx.symbol];
          const changePct = q?.changePercent ?? fallback.changePct;
          const value = q?.price != null ? idx.format(q.price) : fallback.value;
          const spark = sparklines[idx.symbol] ?? fallback.spark;
          const tone = toneForChange(changePct);
          const positive = changePct >= 0;

          return (
            <div
              key={idx.symbol}
              className="flex items-end justify-between gap-2 border-b border-r border-[var(--term-border)] px-4 py-3 last:border-r-0 sm:[&:nth-child(3n)]:border-r-0 xl:[&:nth-child(3n)]:border-r xl:[&:nth-child(5n)]:border-r-0"
            >
              <Metric
                label={idx.label}
                value={value}
                sublabel={`${positive ? "+" : ""}${changePct.toFixed(2)}%`}
                tone={tone}
                size="sm"
              />
              <Sparkline data={spark} positive={positive} width={48} height={24} />
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
