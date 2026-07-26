"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/ui/glass-card";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { Link } from "@/i18n/navigation";
import { useUser } from "@/lib/supabase/use-user";
import { useCandlesByTicker } from "@/lib/queries/accuracy-queries";
import {
  toVotes,
  useCommitteeVerdicts,
  useTriggerCommitteeGeneration,
} from "@/lib/queries/committee-queries";
import { consensus } from "@/lib/committee/types";
import { CommitteeMemberRow } from "@/components/dashboard/committee-member-row";
import { VerdictTimeline } from "@/components/dashboard/verdict-timeline";

export function AssetCommitteePanel({ ticker, name }: { ticker: string; name: string }) {
  const t = useTranslations("Dashboard.committee");
  const { user, loading: userLoading } = useUser();
  const { data: rows, isPending } = useCommitteeVerdicts(ticker);
  const { candlesByTicker } = useCandlesByTicker([ticker]);
  const generateMutation = useTriggerCommitteeGeneration(ticker);
  const triggered = useRef(false);

  const votes = toVotes(rows ?? []);

  useEffect(() => {
    if (userLoading || !user) return;
    if (isPending || votes.length > 0 || triggered.current) return;
    triggered.current = true;
    generateMutation.mutate({ ticker, name });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoading, user, isPending, votes.length, ticker, name]);

  if (isPending || userLoading) {
    return <p className="text-sm text-foreground-muted">…</p>;
  }

  if (votes.length === 0 && !user) {
    return (
      <GlassCard className="max-w-md">
        <p className="text-sm">{t("loginRequired")}</p>
        <Link
          href="/login"
          className="mt-3 inline-block rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background"
        >
          {t("loginCta")}
        </Link>
      </GlassCard>
    );
  }

  if (votes.length === 0) {
    return (
      <GlassCard strong>
        {(generateMutation.isPending || generateMutation.isIdle) && (
          <p className="text-sm text-foreground-muted">{t("generating")}</p>
        )}
        {generateMutation.isError && (
          <p className="text-sm text-nobuy">{t("generationFailed")}</p>
        )}
      </GlassCard>
    );
  }

  const c = consensus(votes);
  const consensusLabel =
    c.verdict === "buy"
      ? t("consensusBuy")
      : c.verdict === "no_buy"
        ? t("consensusNoBuy")
        : t("consensusSplit");

  return (
    <GlassCard strong className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-foreground-muted">
          {c.buy + c.noBuy}/5 {t("voted")}
        </p>
        <VerdictBadge verdict={c.verdict} label={consensusLabel} />
      </div>

      <div>
        <p className="mb-1.5 text-[11px] text-foreground-muted">{t("timelineLabel")}</p>
        <VerdictTimeline votes={votes} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
        {votes.map((vote) => (
          <CommitteeMemberRow key={vote.memberId} vote={vote} candles={candlesByTicker[ticker]} />
        ))}
      </div>
    </GlassCard>
  );
}
