"use client";

import { useTranslations } from "next-intl";
import { useAssets } from "@/lib/queries/dashboard-queries";
import { useCandlesByTicker } from "@/lib/queries/accuracy-queries";
import { GlassCard } from "@/components/ui/glass-card";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { committeeMembers, consensus } from "@/lib/mock/data";
import { aggregateAccuracyByMember } from "@/lib/verdict-accuracy";
import { CommitteeMemberRow } from "@/components/dashboard/committee-member-row";
import { VerdictTimeline } from "@/components/dashboard/verdict-timeline";

export function CommitteeTab() {
  const t = useTranslations("Dashboard.committee");
  const { data: assets, isPending } = useAssets();
  const tickers = assets?.map((a) => a.ticker) ?? [];
  const { candlesByTicker } = useCandlesByTicker(tickers);

  if (isPending || !assets) {
    return <p className="text-sm text-foreground-muted">…</p>;
  }

  const leaderboard = aggregateAccuracyByMember(assets, candlesByTicker)
    .filter((m) => m.total > 0)
    .sort((a, b) => b.correct / b.total - a.correct / a.total);

  return (
    <div className="flex flex-col gap-4">
      {leaderboard.length > 0 && (
        <GlassCard strong>
          <p className="mb-3 text-sm text-foreground-muted">{t("leaderboard")}</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {leaderboard.map((m) => {
              const member = committeeMembers.find((c) => c.id === m.memberId);
              const pct = (m.correct / m.total) * 100;
              return (
                <div key={m.memberId} className="rounded-lg border border-border-subtle px-3 py-2">
                  <p className="text-xs text-foreground-muted">{member?.name}</p>
                  <p className="text-lg font-medium tabular-nums">{pct.toFixed(0)}%</p>
                  <p className="text-[11px] text-foreground-muted">
                    {m.correct}/{m.total} {t("calls")}
                  </p>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {assets.map((asset) => {
          const c = consensus(asset.votes);
          const consensusLabel =
            c.verdict === "buy"
              ? t("consensusBuy")
              : c.verdict === "no_buy"
                ? t("consensusNoBuy")
                : t("consensusSplit");

          return (
            <GlassCard key={asset.id} strong className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {asset.ticker}
                    <span className="ml-2 text-xs text-foreground-muted">{asset.name}</span>
                  </p>
                  <p className="text-xs text-foreground-muted mt-0.5">
                    {c.buy + c.noBuy}/5 {t("voted")}
                  </p>
                </div>
                <VerdictBadge verdict={c.verdict} label={consensusLabel} />
              </div>

              <div>
                <p className="mb-1.5 text-[11px] text-foreground-muted">{t("timelineLabel")}</p>
                <VerdictTimeline votes={asset.votes} />
              </div>

              <div className="flex flex-col gap-3">
                {asset.votes.map((vote) => (
                  <CommitteeMemberRow
                    key={vote.memberId}
                    vote={vote}
                    candles={candlesByTicker[asset.ticker]}
                  />
                ))}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
