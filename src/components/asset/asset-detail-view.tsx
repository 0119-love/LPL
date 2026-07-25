"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { useQuotes } from "@/lib/queries/market-queries";
import { PriceChart } from "./price-chart";
import { FundamentalsPanel } from "./fundamentals-panel";

export function AssetDetailView({ ticker }: { ticker: string }) {
  const t = useTranslations("Asset");
  const { data: quotes, isPending } = useQuotes([ticker]);
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
          <div className="text-right">
            <p className="text-2xl tabular-nums">${quote.c.toFixed(2)}</p>
            <p className={positive ? "text-buy text-sm tabular-nums" : "text-nobuy text-sm tabular-nums"}>
              {positive ? "+" : ""}
              {quote.dp.toFixed(2)}%
            </p>
          </div>
        )}
      </div>

      <GlassCard strong className="mt-6">
        <PriceChart ticker={ticker} />
      </GlassCard>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-medium text-foreground-muted">
          {t("fundamentalsTitle")}
        </h2>
        <FundamentalsPanel ticker={ticker} />
      </div>
    </div>
  );
}
