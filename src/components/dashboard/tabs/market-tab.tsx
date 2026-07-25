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

export function MarketTab() {
  const t = useTranslations("Dashboard.market");
  const { user, loading: userLoading } = useUser();
  const { data: watchlist, isPending: watchlistPending } = useWatchlist();
  const tickers = watchlist?.map((item) => item.ticker) ?? [];
  const { data: quotes, isPending: quotesPending } = useQuotes(tickers);
  const removeMutation = useRemoveFromWatchlist();

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

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-sm">
        <AssetSearch />
      </div>

      {watchlistPending && (
        <p className="text-sm text-foreground-muted">…</p>
      )}

      {!watchlistPending && watchlist?.length === 0 && (
        <GlassCard className="max-w-md">
          <p className="text-sm text-foreground-muted">{t("emptyWatchlist")}</p>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {watchlist?.map((item) => {
          const quote = quotes?.[item.ticker];
          const positive = (quote?.dp ?? 0) >= 0;

          return (
            <GlassCard key={item.watchlistId} className="flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{item.ticker}</p>
                  <p className="text-xs text-foreground-muted">{item.name}</p>
                </div>
                <button
                  onClick={() => removeMutation.mutate(item.watchlistId)}
                  className="text-foreground-muted hover:text-foreground"
                  aria-label="remove"
                >
                  <X size={16} />
                </button>
              </div>

              {quotesPending && !quote ? (
                <p className="text-sm text-foreground-muted">…</p>
              ) : quote ? (
                <div className="flex items-baseline justify-between">
                  <p className="text-lg tabular-nums">
                    ${quote.c.toFixed(2)}
                  </p>
                  <p
                    className={
                      positive
                        ? "text-buy text-sm tabular-nums"
                        : "text-nobuy text-sm tabular-nums"
                    }
                  >
                    {positive ? "+" : ""}
                    {quote.dp.toFixed(2)}%
                  </p>
                </div>
              ) : (
                <p className="text-sm text-foreground-muted">{t("quoteUnavailable")}</p>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
