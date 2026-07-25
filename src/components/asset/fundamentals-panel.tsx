"use client";

import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/ui/glass-card";
import { useFundamentals } from "@/lib/queries/asset-queries";

function formatLarge(n: number | null) {
  if (n == null) return "—";
  if (Math.abs(n) >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  return n.toLocaleString();
}

function formatPct(n: number | null) {
  if (n == null) return "—";
  return `${(n * 100).toFixed(1)}%`;
}

function formatNum(n: number | null, digits = 2) {
  if (n == null) return "—";
  return n.toFixed(digits);
}

export function FundamentalsPanel({ ticker }: { ticker: string }) {
  const t = useTranslations("Asset");
  const { data, isPending, isError } = useFundamentals(ticker);

  if (isPending) {
    return <p className="text-sm text-foreground-muted">…</p>;
  }
  if (isError || !data) {
    return <p className="text-sm text-foreground-muted">{t("fundamentalsError")}</p>;
  }

  const rows: { label: string; value: string }[] = [
    { label: t("marketCap"), value: formatLarge(data.marketCap) },
    { label: t("trailingPE"), value: formatNum(data.trailingPE) },
    { label: t("forwardPE"), value: formatNum(data.forwardPE) },
    { label: t("eps"), value: formatNum(data.trailingEps) },
    { label: t("dividendYield"), value: formatPct(data.dividendYield) },
    { label: t("revenue"), value: formatLarge(data.totalRevenue) },
    { label: t("grossMargin"), value: formatPct(data.grossMargins) },
    { label: t("ebitdaMargin"), value: formatPct(data.ebitdaMargins) },
    { label: t("debtToEquity"), value: formatNum(data.debtToEquity, 1) },
    { label: t("currentRatio"), value: formatNum(data.currentRatio) },
    { label: t("beta"), value: formatNum(data.beta) },
    { label: t("week52Range"), value: `${formatNum(data.fiftyTwoWeekLow)} – ${formatNum(data.fiftyTwoWeekHigh)}` },
  ];

  return (
    <div>
      {data.recommendationKey && (
        <GlassCard strong className="mb-4">
          <p className="text-xs text-foreground-muted">{t("analystConsensus")}</p>
          <div className="mt-1 flex items-baseline justify-between">
            <p className="text-lg font-medium uppercase">{data.recommendationKey}</p>
            <p className="text-sm text-foreground-muted">
              {data.numberOfAnalystOpinions} {t("analysts")} · {t("target")} $
              {formatNum(data.targetMeanPrice)}
            </p>
          </div>
        </GlassCard>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {rows.map((row) => (
          <div key={row.label} className="rounded-lg border border-border-subtle bg-white/[0.02] px-3 py-2">
            <p className="text-[11px] text-foreground-muted">{row.label}</p>
            <p className="text-sm tabular-nums">{row.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
