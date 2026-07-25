"use client";

import { clsx } from "clsx";
import { useTranslations } from "next-intl";
import { useAssets } from "@/lib/queries/dashboard-queries";
import { GlassCard } from "@/components/ui/glass-card";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { committeeMembers, consensus } from "@/lib/mock/data";

export function CommitteeTab() {
  const t = useTranslations("Dashboard.committee");
  const { data: assets, isPending } = useAssets();

  if (isPending) {
    return <p className="text-sm text-foreground-muted">…</p>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {assets?.map((asset) => {
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
                  <span className="ml-2 text-xs text-foreground-muted">
                    {asset.name}
                  </span>
                </p>
                <p className="text-xs text-foreground-muted mt-0.5">
                  {c.buy + c.noBuy}/5 {t("voted")}
                </p>
              </div>
              <VerdictBadge verdict={c.verdict} label={consensusLabel} />
            </div>

            <div className="flex flex-col gap-2.5">
              {asset.votes.map((vote) => {
                const member = committeeMembers.find(
                  (m) => m.id === vote.memberId,
                );
                return (
                  <div key={vote.memberId} className="flex items-start gap-3">
                    <div
                      className={clsx(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                        vote.verdict === "buy"
                          ? "bg-buy-soft text-buy"
                          : "bg-nobuy-soft text-nobuy",
                      )}
                    >
                      {member?.initial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm">
                        {member?.name}
                        <span
                          className={clsx(
                            "ml-2 text-xs",
                            vote.verdict === "buy" ? "text-buy" : "text-nobuy",
                          )}
                        >
                          {vote.verdict === "buy" ? t("buy") : t("noBuy")}
                        </span>
                      </p>
                      <p className="text-xs text-foreground-muted">
                        {vote.rationale}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
