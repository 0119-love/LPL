"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { useQuotes, useSymbolSearch } from "@/lib/queries/market-queries";
import { PriceChart } from "./price-chart";
import { FundamentalsPanel } from "./fundamentals-panel";
import { AssetCommitteePanel } from "./asset-committee-panel";

export function AssetDetailView({ ticker }: { ticker: string }) {
  const t = useTranslations("Asset");
  const tc = useTranslations("Dashboard.committee");
  const { data: quotes, isPending } = useQuotes([ticker]);
  const { data: searchResult } = useSymbolSearch(ticker);
  const name =
    searchResult?.result.find((r) => r.symbol === ticker)?.description ?? ticker;
  const quote = quotes?.[ticker];
  const positive = (quote?.dp ?? 0) >= 0;

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-6 py-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground"
      >
        <ArrowLeft size={16} />
        {t("back")}
      </Link>

      <div className="mt-4 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">{ticker}</h1>
        {!isPending && quote && (
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-semibold tabular-nums">${quote.c.toFixed(2)}</p>
            <span
              className={
                positive
                  ? "rounded-full bg-buy-soft px-2 py-0.5 text-xs font-medium text-buy tabular-nums"
                  : "rounded-full bg-nobuy-soft px-2 py-0.5 text-xs font-medium text-nobuy tabular-nums"
              }
            >
              {positive ? "+" : ""}
              {quote.dp.toFixed(2)}%
            </span>
          </div>
        )}
      </div>

      <GlassCard strong className="mt-6">
        <PriceChart ticker={ticker} />
      </GlassCard>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-medium text-foreground-muted">
          {tc("title")}
        </h2>
        <AssetCommitteePanel ticker={ticker} name={name} />
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-medium text-foreground-muted">
          {t("fundamentalsTitle")}
        </h2>
        <FundamentalsPanel ticker={ticker} />
      </div>
    </div>
  );
}
