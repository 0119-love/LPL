"use client";

import { Panel } from "../ui/panel";
import { Metric } from "../ui/metric";
import { toneForChange } from "../ui/tone";
import { useYahooQuotes } from "@/lib/queries/terminal-queries";

const REGIONS = [
  { symbol: "^GSPC", label: "United States", index: "S&P 500" },
  { symbol: "^GDAXI", label: "Germany", index: "DAX" },
  { symbol: "^FTSE", label: "United Kingdom", index: "FTSE 100" },
  { symbol: "^N225", label: "Japan", index: "Nikkei 225" },
  { symbol: "^HSI", label: "Hong Kong", index: "Hang Seng" },
  { symbol: "^BSESN", label: "India", index: "SENSEX" },
  { symbol: "^BVSP", label: "Brazil", index: "Bovespa" },
  { symbol: "^AXJO", label: "Australia", index: "ASX 200" },
];

export function GlobalMapSection() {
  const symbols = REGIONS.map((r) => r.symbol);
  const { data: quotes, isPending, isError } = useYahooQuotes(symbols);
  const isLive = !isPending && !isError;

  return (
    <Panel
      id="section-map"
      eyebrow="Global Map"
      meta={isLive ? "Live" : isPending ? "Loading…" : "Unavailable"}
      noPadding
    >
      <div className="grid grid-cols-2 sm:grid-cols-4">
        {REGIONS.map((region, i) => {
          const q = quotes?.[region.symbol];
          const changePct = q?.changePercent ?? 0;
          const hasData = q?.price != null;
          const tone = toneForChange(changePct);
          return (
            <div
              key={region.symbol}
              className={`border-b border-r border-[var(--term-border)] px-4 py-3.5 last:border-r-0 sm:[&:nth-child(4n)]:border-r-0 ${
                i >= REGIONS.length - (REGIONS.length % 4 || 4) ? "border-b-0" : ""
              }`}
            >
              <Metric
                label={region.label}
                value={hasData ? q!.price!.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—"}
                sublabel={
                  hasData ? (
                    <>
                      {region.index} · {changePct >= 0 ? "+" : ""}
                      {changePct.toFixed(2)}%
                    </>
                  ) : (
                    region.index
                  )
                }
                tone={hasData ? tone : "neutral"}
                size="sm"
              />
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
