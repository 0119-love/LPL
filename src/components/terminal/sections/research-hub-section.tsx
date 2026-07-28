"use client";

import { Panel } from "../ui/panel";
import { Metric } from "../ui/metric";
import { useFundamentals } from "@/lib/queries/asset-queries";

const SPOTLIGHT_TICKER = "NVDA";

const fmtUsd = (v: number | null) => (v == null ? "—" : `$${v.toFixed(2)}`);
const fmtBillions = (v: number | null) => (v == null ? "—" : `$${(v / 1_000_000_000).toFixed(1)}B`);
const fmtPct = (v: number | null) => (v == null ? "—" : `${(v * 100).toFixed(1)}%`);
const fmtRatio = (v: number | null) => (v == null ? "—" : v.toFixed(2));
const fmtRecommendation = (key: string | null) =>
  key ? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—";

export function ResearchHubSection() {
  const { data, isPending } = useFundamentals(SPOTLIGHT_TICKER);

  return (
    <Panel
      id="section-research"
      eyebrow="Research Hub"
      meta={isPending ? "Loading…" : `${SPOTLIGHT_TICKER} · Live`}
      bodyClassName="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-5"
    >
      <Metric label="Market Cap" value={fmtBillions(data?.marketCap ?? null)} size="sm" />
      <Metric label="P/E (TTM)" value={fmtRatio(data?.trailingPE ?? null)} size="sm" />
      <Metric label="P/E (Fwd)" value={fmtRatio(data?.forwardPE ?? null)} size="sm" />
      <Metric label="Beta" value={fmtRatio(data?.beta ?? null)} size="sm" />

      <Metric label="Analyst Target" value={fmtUsd(data?.targetMeanPrice ?? null)} size="sm" tone="buy" />
      <Metric
        label="Analyst Rating"
        value={fmtRecommendation(data?.recommendationKey ?? null)}
        sublabel={data?.numberOfAnalystOpinions ? `${data.numberOfAnalystOpinions} analysts` : undefined}
        size="sm"
      />
      <Metric label="52W High" value={fmtUsd(data?.fiftyTwoWeekHigh ?? null)} size="sm" />
      <Metric label="52W Low" value={fmtUsd(data?.fiftyTwoWeekLow ?? null)} size="sm" />

      <Metric label="Gross Margin" value={fmtPct(data?.grossMargins ?? null)} size="sm" />
      <Metric label="EBITDA Margin" value={fmtPct(data?.ebitdaMargins ?? null)} size="sm" />
      <Metric label="Debt / Equity" value={fmtRatio(data?.debtToEquity ?? null)} size="sm" />
      <Metric label="Dividend Yield" value={fmtPct(data?.dividendYield ?? null)} size="sm" />
    </Panel>
  );
}
