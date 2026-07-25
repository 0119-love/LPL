"use client";

import { useTranslations } from "next-intl";
import { usePortfolio, useAssets } from "@/lib/queries/dashboard-queries";
import { GlassCard } from "@/components/ui/glass-card";
import { Sparkline } from "@/components/ui/sparkline";

export function PortfolioTab() {
  const t = useTranslations("Dashboard.portfolio");
  const { data: portfolio, isPending } = usePortfolio();
  const { data: assets } = useAssets();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <GlassCard strong className="md:col-span-3">
        <p className="text-sm text-foreground-muted">{t("totalValue")}</p>
        <div className="mt-1 flex items-baseline gap-3">
          <p className="text-3xl font-semibold tabular-nums">
            {isPending
              ? "—"
              : `$${portfolio?.totalValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
          </p>
          {portfolio && (
            <span
              className={
                portfolio.todayChangePct >= 0
                  ? "text-buy text-sm"
                  : "text-nobuy text-sm"
              }
            >
              {portfolio.todayChangePct >= 0 ? "+" : ""}
              {portfolio.todayChangePct.toFixed(1)}% · {t("todayChange")}
            </span>
          )}
        </div>
      </GlassCard>

      {portfolio?.holdings.map((holding) => {
        const asset = assets?.find((a) => a.id === holding.assetId);
        if (!asset) return null;
        return (
          <GlassCard key={holding.assetId} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{asset.ticker}</p>
                <p className="text-xs text-foreground-muted">
                  {holding.quantity} shares
                </p>
              </div>
              <p className="text-sm tabular-nums">
                ${(asset.price * holding.quantity).toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
            <Sparkline
              data={asset.sparkline}
              positive={asset.changePct >= 0}
              width={220}
              height={44}
            />
          </GlassCard>
        );
      })}
    </div>
  );
}
