"use client";

import { useTranslations } from "next-intl";
import { X, Gavel, BellRing, Search } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { BentoGrid, bentoSpan, type BentoSize } from "@/components/ui/bento-grid";
import { FeatureTeaser } from "@/components/ui/feature-teaser";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { AssetSearch } from "@/components/dashboard/asset-search";
import { Link } from "@/i18n/navigation";
import { useUser } from "@/lib/supabase/use-user";
import {
  useQuotes,
  useRemoveFromWatchlist,
  useWatchlist,
} from "@/lib/queries/market-queries";
import type { FinnhubQuote } from "@/lib/finnhub/client";

// Real, live-quoted tickers shown to signed-out visitors as a preview —
// not fabricated data, just a fixed sample list instead of a private watchlist.
const DEMO_WATCHLIST = [
  { ticker: "AAPL", name: "Apple Inc." },
  { ticker: "NVDA", name: "NVIDIA Corp." },
  { ticker: "TSLA", name: "Tesla, Inc." },
];

// First tile is the featured 2x2 hero, next two are tall — together they
// fill a clean 4x2 block on desktop before falling back to small tiles.
function sizeForIndex(index: number): BentoSize {
  if (index === 0) return "hero";
  if (index === 1 || index === 2) return "tall";
  return "small";
}

export function MarketTab() {
  const t = useTranslations("Dashboard.market");
  const tc = useTranslations("Common");
  const { user, loading: userLoading } = useUser();
  const {
    data: watchlist,
    isPending: watchlistPending,
    isError: watchlistError,
    refetch: refetchWatchlist,
  } = useWatchlist();
  const removeMutation = useRemoveFromWatchlist();

  const tickers = user
    ? (watchlist?.map((item) => item.ticker) ?? [])
    : DEMO_WATCHLIST.map((item) => item.ticker);
  const { data: quotes, isPending: quotesPending } = useQuotes(tickers);

  if (userLoading) return null;

  if (!user) {
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
          {DEMO_WATCHLIST.map((item, i) => (
            <TickerCard
              key={item.ticker}
              ticker={item.ticker}
              name={item.name}
              quote={quotes?.[item.ticker]}
              quotesPending={quotesPending}
              size={sizeForIndex(i)}
            />
          ))}
        </BentoGrid>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-sm">
        <AssetSearch />
      </div>

      {watchlistPending && <p className="text-sm text-foreground-muted">…</p>}

      {watchlistError && (
        <GlassCard className="max-w-md">
          <p className="text-sm text-nobuy">{tc("errorGeneric")}</p>
          <button
            onClick={() => refetchWatchlist()}
            className="mt-2 text-xs text-foreground-muted underline hover:text-foreground"
          >
            {tc("retry")}
          </button>
        </GlassCard>
      )}

      {!watchlistPending && !watchlistError && (
        <BentoGrid>
          {watchlist && watchlist.length > 0 ? (
            watchlist.map((item, i) => (
              <TickerCard
                key={item.watchlistId}
                ticker={item.ticker}
                name={item.name}
                quote={quotes?.[item.ticker]}
                quotesPending={quotesPending}
                onRemove={() => removeMutation.mutate(item.watchlistId)}
                size={sizeForIndex(i)}
              />
            ))
          ) : (
            <>
              <GlassCard className={`${bentoSpan("hero")} flex flex-col items-center justify-center gap-3 text-center`}>
                <Search size={22} strokeWidth={1.5} className="text-foreground-muted" />
                <p className="max-w-[220px] text-sm text-foreground-muted">{t("emptyWatchlist")}</p>
              </GlassCard>

              <FeatureTeaser icon={Gavel} label={t("comingCommittee")} className={bentoSpan("tall")}>
                <div className="flex h-full flex-col justify-center gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">AAPL</p>
                      <p className="text-[11px] text-foreground-muted">Apple Inc.</p>
                    </div>
                    <VerdictBadge verdict="buy" label="BUY" />
                  </div>
                  <div className="flex -space-x-1.5">
                    {["buy", "buy", "no_buy", "buy", "no_buy"].map((v, i) => (
                      <div
                        key={i}
                        className={
                          v === "buy"
                            ? "h-5 w-5 rounded-full border-2 border-background bg-buy-soft"
                            : "h-5 w-5 rounded-full border-2 border-background bg-nobuy-soft"
                        }
                      />
                    ))}
                  </div>
                </div>
              </FeatureTeaser>

              <FeatureTeaser icon={BellRing} label={t("comingAlerts")} className={bentoSpan("tall")}>
                <div className="flex h-full flex-col justify-center gap-3">
                  <div>
                    <p className="text-sm font-medium">
                      NVDA <span className="font-normal text-foreground-muted">$180.00+</span>
                    </p>
                    <p className="text-[11px] text-foreground-muted">$187.42</p>
                  </div>
                  <span className="w-fit rounded-full bg-buy-soft px-2 py-0.5 text-[11px] font-medium text-buy">
                    ● triggered
                  </span>
                </div>
              </FeatureTeaser>
            </>
          )}
        </BentoGrid>
      )}
    </div>
  );
}

function TickerCard({
  ticker,
  name,
  quote,
  quotesPending,
  onRemove,
  size,
}: {
  ticker: string;
  name: string;
  quote?: FinnhubQuote;
  quotesPending: boolean;
  onRemove?: () => void;
  size: BentoSize;
}) {
  const t = useTranslations("Dashboard.market");
  const positive = (quote?.dp ?? 0) >= 0;
  const compact = size === "small";

  return (
    <GlassCard
      className={`flex flex-col gap-3 transition-colors hover:border-white/20 ${bentoSpan(size)}`}
    >
      <div className="flex items-start justify-between">
        <Link href={`/asset/${ticker}`} className="min-w-0 hover:opacity-80">
          <p className={compact ? "text-sm font-medium" : "font-medium"}>{ticker}</p>
          {!compact && <p className="text-xs text-foreground-muted truncate">{name}</p>}
        </Link>
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-foreground-muted hover:text-foreground"
            aria-label={t("remove", { ticker })}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {quotesPending && !quote ? (
        <p className="text-sm text-foreground-muted">…</p>
      ) : quote ? (
        <div className="flex flex-1 flex-col justify-end gap-2.5">
          <div className="flex items-baseline justify-between">
            <p className={compact ? "text-lg font-semibold tabular-nums" : "text-2xl font-semibold tabular-nums"}>
              ${quote.c.toFixed(2)}
            </p>
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
          {!compact && (
            <div className="flex items-center justify-between border-t border-border-subtle pt-2.5 text-[11px] text-foreground-muted">
              <span>
                H <span className="tabular-nums text-foreground">{quote.h.toFixed(2)}</span>
              </span>
              <span>
                L <span className="tabular-nums text-foreground">{quote.l.toFixed(2)}</span>
              </span>
              <span>
                {t("todaySuffix")}{" "}
                <span className="tabular-nums text-foreground">{quote.pc.toFixed(2)}</span>
              </span>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-foreground-muted">{t("quoteUnavailable")}</p>
      )}
    </GlassCard>
  );
}
