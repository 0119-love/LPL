"use client";

import { useTranslations } from "next-intl";
import { useAssets } from "@/lib/queries/dashboard-queries";
import { GlassCard } from "@/components/ui/glass-card";
import { Sparkline } from "@/components/ui/sparkline";
import { consensus } from "@/lib/mock/data";
import { VerdictBadge } from "@/components/ui/verdict-badge";

export function MarketTab() {
  const t = useTranslations("Dashboard.market");
  const tc = useTranslations("Dashboard.committee");
  const { data: assets, isPending } = useAssets();

  const totalVolume =
    assets?.reduce((sum, a) => sum + a.volumeToday, 0) ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <GlassCard strong className="md:col-span-2">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-foreground-muted">{t("volumeCard")}</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">
              {isPending ? "—" : totalVolume.toLocaleString()}
              <span className="ml-1.5 text-sm font-normal text-foreground-muted">
                {t("todaySuffix")}
              </span>
            </p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-4 gap-4">
          {assets?.map((asset) => (
            <div key={asset.id}>
              <p className="text-xs text-foreground-muted">{asset.ticker}</p>
              <Sparkline
                data={asset.sparkline}
                positive={asset.changePct >= 0}
                width={100}
                height={32}
              />
              <p
                className={
                  asset.changePct >= 0 ? "text-buy text-xs" : "text-nobuy text-xs"
                }
              >
                {asset.changePct >= 0 ? "+" : ""}
                {asset.changePct.toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <p className="text-sm text-foreground-muted mb-3">{t("topAssets")}</p>
        <div className="flex flex-col gap-3">
          {assets?.slice(0, 3).map((asset) => (
            <div key={asset.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{asset.ticker}</p>
                <p className="text-xs text-foreground-muted">{asset.name}</p>
              </div>
              <p className="text-sm tabular-nums">${asset.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {assets?.map((asset) => {
        const c = consensus(asset.votes);
        return (
          <GlassCard key={asset.id} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{asset.ticker}</p>
                <p className="text-xs text-foreground-muted">{asset.name}</p>
              </div>
              <VerdictBadge
                verdict={c.verdict}
                label={
                  c.verdict === "buy"
                    ? tc("buy")
                    : c.verdict === "no_buy"
                      ? tc("noBuy")
                      : tc("consensusSplit")
                }
              />
            </div>
            <Sparkline
              data={asset.sparkline}
              positive={asset.changePct >= 0}
              width={220}
              height={48}
            />
            <div className="flex items-baseline justify-between">
              <p className="text-lg tabular-nums">${asset.price.toFixed(2)}</p>
              <p
                className={
                  asset.changePct >= 0
                    ? "text-buy text-sm tabular-nums"
                    : "text-nobuy text-sm tabular-nums"
                }
              >
                {asset.changePct >= 0 ? "+" : ""}
                {asset.changePct.toFixed(1)}%
              </p>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
