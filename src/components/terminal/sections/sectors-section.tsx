"use client";

import { Panel } from "../ui/panel";
import { useQuotes } from "@/lib/queries/market-queries";

// Real sector performance via SPDR Select Sector ETFs — no market-breadth
// data source exists in this stack, but these are real, liquid, quotable
// tickers, so sector performance can be genuinely real instead of mock.
const SECTORS = [
  { ticker: "XLK", label: "Technology" },
  { ticker: "XLF", label: "Financials" },
  { ticker: "XLV", label: "Health Care" },
  { ticker: "XLY", label: "Consumer Discretionary" },
  { ticker: "XLP", label: "Consumer Staples" },
  { ticker: "XLE", label: "Energy" },
  { ticker: "XLI", label: "Industrials" },
  { ticker: "XLU", label: "Utilities" },
  { ticker: "XLB", label: "Materials" },
  { ticker: "XLRE", label: "Real Estate" },
];

export function SectorsSection() {
  const tickers = SECTORS.map((s) => s.ticker);
  const { data: quotes, isPending } = useQuotes(tickers);

  const rows = SECTORS.map((s) => ({
    ...s,
    changePct: quotes?.[s.ticker]?.dp ?? 0,
    hasData: !!quotes?.[s.ticker],
  })).sort((a, b) => b.changePct - a.changePct);

  const maxAbs = Math.max(1, ...rows.map((r) => Math.abs(r.changePct)));

  return (
    <Panel
      id="section-sectors"
      eyebrow="Sectors"
      meta={isPending ? "Loading…" : "Sector ETFs · Live"}
      noPadding
    >
      <div className="divide-y divide-[var(--term-border)]">
        {rows.map((row) => {
          const positive = row.changePct >= 0;
          const barWidth = (Math.abs(row.changePct) / maxAbs) * 100;
          return (
            <div key={row.ticker} className="flex items-center gap-3 px-4 py-2.5">
              <span className="w-8 shrink-0 text-[11px] font-semibold text-[var(--term-text-mid)]">
                {row.ticker}
              </span>
              <span className="w-40 shrink-0 truncate text-[12px] text-[var(--term-text)]">
                {row.label}
              </span>
              <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className={`h-full rounded-full ${positive ? "bg-[var(--term-buy)]" : "bg-[var(--term-nobuy)]"}`}
                  style={{ width: row.hasData ? `${barWidth}%` : "0%" }}
                />
              </div>
              <span
                className={`term-mono w-16 shrink-0 text-right text-[12px] font-medium ${
                  row.hasData ? (positive ? "text-[var(--term-buy)]" : "text-[var(--term-nobuy)]") : "text-[var(--term-text-dim)]"
                }`}
              >
                {row.hasData ? `${positive ? "+" : ""}${row.changePct.toFixed(2)}%` : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
