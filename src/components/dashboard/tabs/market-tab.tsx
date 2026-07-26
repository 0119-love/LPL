"use client";

import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DEMO_WATCHLIST.map((item) => (
            <TickerCard
              key={item.ticker}
              ticker={item.ticker}
              name={item.name}
              quote={quotes?.[item.ticker]}
              quotesPending={quotesPending}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-sm">
        <AssetSearch />
      </div>

      {watchlistPending && (
        <p className="text-sm text-foreground-muted">…</p>
      )}

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

      {!watchlistPending && !watchlistError && watchlist?.length === 0 && (
        <GlassCard className="max-w-md">
          <p className="text-sm text-foreground-muted">{t("emptyWatchlist")}</p>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {watchlist?.map((item) => (
          <TickerCard
            key={item.watchlistId}
            ticker={item.ticker}
            name={item.name}
            quote={quotes?.[item.ticker]}
            quotesPending={quotesPending}
            onRemove={() => removeMutation.mutate(item.watchlistId)}
          />
        ))}
      </div>
    </div>
  );
}

function TickerCard({
  ticker,
  name,
  quote,
  quotesPending,
  onRemove,
}: {
  ticker: string;
  name: string;
  quote?: FinnhubQuote;
  quotesPending: boolean;
  onRemove?: () => void;
}) {
  const t = useTranslations("Dashboard.market");
  const positive = (quote?.dp ?? 0) >= 0;

  return (
    <GlassCard className="flex flex-col gap-3 transition-colors hover:border-white/20">
      <div className="flex items-start justify-between">
        <Link href={`/asset/${ticker}`} className="min-w-0 hover:opacity-80">
          <p className="font-medium">{ticker}</p>
          <p className="text-xs text-foreground-muted truncate">{name}</p>
        </Link>
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-foreground-muted hover:text-foreground"
            aria-label={t("remove", { ticker })}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {quotesPending && !quote ? (
        <p className="text-sm text-foreground-muted">…</p>
      ) : quote ? (
        <>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-semibold tabular-nums">
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
        </>
      ) : (
        <p className="text-sm text-foreground-muted">{t("quoteUnavailable")}</p>
      )}
    </GlassCard>
  );
}
