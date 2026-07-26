"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/ui/glass-card";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { Link } from "@/i18n/navigation";
import { useUser } from "@/lib/supabase/use-user";
import { useWatchlist } from "@/lib/queries/market-queries";
import { useCandlesByTicker } from "@/lib/queries/accuracy-queries";
import {
  toVotes,
  useCommitteeVerdictsForTickers,
  useTriggerCommitteeGeneration,
} from "@/lib/queries/committee-queries";
import { committeeMembers } from "@/lib/committee/members";
import { consensus, type Vote } from "@/lib/committee/types";
import { aggregateAccuracyByMember } from "@/lib/verdict-accuracy";
import { CommitteeMemberRow } from "@/components/dashboard/committee-member-row";
import { VerdictTimeline } from "@/components/dashboard/verdict-timeline";
import type { Candle } from "@/lib/yahoo/client";

export function CommitteeTab() {
  const t = useTranslations("Dashboard.committee");
  const { user, loading: userLoading } = useUser();
  const { data: watchlist, isPending: watchlistPending } = useWatchlist();
  const tickers = watchlist?.map((w) => w.ticker) ?? [];

  const { rowsByTicker, pendingByTicker } = useCommitteeVerdictsForTickers(tickers);
  const { candlesByTicker } = useCandlesByTicker(tickers);

  if (userLoading) return null;

  if (!user) {
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

  if (watchlistPending) {
    return <p className="text-sm text-foreground-muted">…</p>;
  }

  if (!watchlist || watchlist.length === 0) {
    return (
      <GlassCard className="max-w-md">
        <p className="text-sm text-foreground-muted">{t("emptyWatchlist")}</p>
      </GlassCard>
    );
  }

  const assetsWithVotes = watchlist.map((w) => ({
    ticker: w.ticker,
    name: w.name,
    votes: toVotes(rowsByTicker[w.ticker] ?? []),
  }));

  const leaderboard = aggregateAccuracyByMember(assetsWithVotes, candlesByTicker)
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
                <div key={m.memberId} className="rounded-lg border border-border-subtle bg-white/[0.02] px-3 py-2">
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
        {assetsWithVotes.map((asset) => (
          <CommitteeAssetCard
            key={asset.ticker}
            ticker={asset.ticker}
            name={asset.name}
            votes={asset.votes}
            pending={pendingByTicker[asset.ticker]}
            candles={candlesByTicker[asset.ticker]}
          />
        ))}
      </div>
    </div>
  );
}

function CommitteeAssetCard({
  ticker,
  name,
  votes,
  pending,
  candles,
}: {
  ticker: string;
  name: string;
  votes: Vote[];
  pending: boolean;
  candles?: Candle[];
}) {
  const t = useTranslations("Dashboard.committee");
  const generateMutation = useTriggerCommitteeGeneration(ticker);
  const triggered = useRef(false);

  useEffect(() => {
    if (pending || votes.length > 0 || triggered.current) return;
    triggered.current = true;
    generateMutation.mutate({ ticker, name });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending, votes.length, ticker, name]);

  if (votes.length === 0) {
    return (
      <GlassCard strong>
        <p className="font-medium">
          {ticker}
          <span className="ml-2 text-xs text-foreground-muted">{name}</span>
        </p>
        {(pending || generateMutation.isPending) && (
          <p className="mt-2 text-sm text-foreground-muted">{t("generating")}</p>
        )}
        {generateMutation.isError && (
          <p className="mt-2 text-sm text-nobuy">{t("generationFailed")}</p>
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
        <div>
          <p className="font-medium">
            {ticker}
            <span className="ml-2 text-xs text-foreground-muted">{name}</span>
          </p>
          <p className="text-xs text-foreground-muted mt-0.5">
            {c.buy + c.noBuy}/5 {t("voted")}
          </p>
        </div>
        <VerdictBadge verdict={c.verdict} label={consensusLabel} />
      </div>

      <div>
        <p className="mb-1.5 text-[11px] text-foreground-muted">{t("timelineLabel")}</p>
        <VerdictTimeline votes={votes} />
      </div>

      <div className="flex flex-col gap-3">
        {votes.map((vote) => (
          <CommitteeMemberRow key={vote.memberId} vote={vote} candles={candles} />
        ))}
      </div>
    </GlassCard>
  );
}
