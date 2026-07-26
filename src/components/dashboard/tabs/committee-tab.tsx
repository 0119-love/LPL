"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/ui/glass-card";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { BentoGrid, bentoSpan, type BentoSize } from "@/components/ui/bento-grid";
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

// Real, publicly-readable committee verdicts shown to signed-out visitors —
// same fixed tickers as the market tab's demo watchlist. Generation is never
// triggered here (that requires auth server-side); we only display verdicts
// that already exist.
const DEMO_TICKERS = [
  { ticker: "AAPL", name: "Apple Inc." },
  { ticker: "NVDA", name: "NVIDIA Corp." },
  { ticker: "TSLA", name: "Tesla, Inc." },
];

export function CommitteeTab() {
  const t = useTranslations("Dashboard.committee");
  const { user, loading: userLoading } = useUser();
  const { data: watchlist, isPending: watchlistPending } = useWatchlist();
  const tickers = user
    ? (watchlist?.map((w) => w.ticker) ?? [])
    : DEMO_TICKERS.map((d) => d.ticker);

  const { rowsByTicker, pendingByTicker } = useCommitteeVerdictsForTickers(tickers);
  const { candlesByTicker } = useCandlesByTicker(tickers);

  if (userLoading) return null;

  if (!user) {
    const assetsWithVotes = DEMO_TICKERS.map((d) => ({
      ticker: d.ticker,
      name: d.name,
      votes: toVotes(rowsByTicker[d.ticker] ?? []),
    }));

    return (
      <div className="flex flex-col gap-4">
        <GlassCard className="flex flex-wrap items-center justify-between gap-3 !py-3">
          <p className="text-sm text-foreground-muted">{t("demoNotice")}</p>
          <Link
            href="/login"
            className="shrink-0 rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-90"
          >
            {t("loginCta")}
          </Link>
        </GlassCard>

        <BentoGrid>
          {assetsWithVotes.map((asset, i) => (
            <CommitteeAssetCard
              key={asset.ticker}
              ticker={asset.ticker}
              name={asset.name}
              votes={asset.votes}
              pending={pendingByTicker[asset.ticker]}
              candles={candlesByTicker[asset.ticker]}
              allowGenerate={false}
              size={i === 0 ? "full" : "wide"}
            />
          ))}
        </BentoGrid>
      </div>
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
        <div>
          <p className="mb-2 text-sm text-foreground-muted">{t("leaderboard")}</p>
          <BentoGrid className="auto-rows-[minmax(72px,auto)]">
            {leaderboard.map((m, i) => {
              const member = committeeMembers.find((c) => c.id === m.memberId);
              const pct = (m.correct / m.total) * 100;
              const size: BentoSize = i === 0 ? "wide" : "small";
              return (
                <GlassCard
                  key={m.memberId}
                  strong={i === 0}
                  className={`flex flex-col justify-center ${bentoSpan(size)}`}
                >
                  <p className="text-xs text-foreground-muted">{member?.name}</p>
                  <p className={i === 0 ? "text-3xl font-semibold tabular-nums" : "text-lg font-medium tabular-nums"}>
                    {pct.toFixed(0)}%
                  </p>
                  <p className="text-[11px] text-foreground-muted">
                    {m.correct}/{m.total} {t("calls")}
                  </p>
                </GlassCard>
              );
            })}
          </BentoGrid>
        </div>
      )}

      <BentoGrid>
        {assetsWithVotes.map((asset, i) => (
          <CommitteeAssetCard
            key={asset.ticker}
            ticker={asset.ticker}
            name={asset.name}
            votes={asset.votes}
            pending={pendingByTicker[asset.ticker]}
            candles={candlesByTicker[asset.ticker]}
            size={i === 0 ? "full" : "wide"}
          />
        ))}
      </BentoGrid>
    </div>
  );
}

function CommitteeAssetCard({
  ticker,
  name,
  votes,
  pending,
  candles,
  size,
  allowGenerate = true,
}: {
  ticker: string;
  name: string;
  votes: Vote[];
  pending: boolean;
  candles?: Candle[];
  size: BentoSize;
  allowGenerate?: boolean;
}) {
  const t = useTranslations("Dashboard.committee");
  const generateMutation = useTriggerCommitteeGeneration(ticker);
  const triggered = useRef(false);

  useEffect(() => {
    if (!allowGenerate) return;
    if (pending || votes.length > 0 || triggered.current) return;
    triggered.current = true;
    generateMutation.mutate({ ticker, name });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowGenerate, pending, votes.length, ticker, name]);

  if (votes.length === 0) {
    return (
      <GlassCard strong className={bentoSpan(size)}>
        <p className="font-medium">
          {ticker}
          <span className="ml-2 text-xs text-foreground-muted">{name}</span>
        </p>
        {allowGenerate && (pending || generateMutation.isPending) && (
          <p className="mt-2 text-sm text-foreground-muted">{t("generating")}</p>
        )}
        {allowGenerate && generateMutation.isError && (
          <p className="mt-2 text-sm text-nobuy">{t("generationFailed")}</p>
        )}
        {!allowGenerate && !pending && (
          <p className="mt-2 text-sm text-foreground-muted">{t("demoNotReady")}</p>
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
    <GlassCard strong className={`flex flex-col gap-4 ${bentoSpan(size)}`}>
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

      <div className={size === "full" ? "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3" : "flex flex-col gap-3"}>
        {votes.map((vote) => (
          <CommitteeMemberRow key={vote.memberId} vote={vote} candles={candles} />
        ))}
      </div>
    </GlassCard>
  );
}
