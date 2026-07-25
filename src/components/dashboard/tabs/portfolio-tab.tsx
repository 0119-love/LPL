"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/ui/glass-card";
import { Link } from "@/i18n/navigation";
import { useUser } from "@/lib/supabase/use-user";
import { useQuotes } from "@/lib/queries/market-queries";
import {
  usePortfolioHoldings,
  usePortfolioSnapshots,
  usePortfolioTransactions,
  useRecordSnapshot,
} from "@/lib/queries/portfolio-queries";
import { TransactionForm } from "@/components/dashboard/transaction-form";
import { AllocationDonut } from "@/components/asset/allocation-donut";
import { PortfolioValueChart } from "@/components/asset/portfolio-value-chart";

export function PortfolioTab() {
  const t = useTranslations("Dashboard.portfolio");
  const tc = useTranslations("Common");
  const { user, loading: userLoading } = useUser();
  const {
    data: holdings,
    isPending: holdingsPending,
    isError: holdingsError,
    refetch: refetchHoldings,
  } = usePortfolioHoldings();
  const { data: transactions } = usePortfolioTransactions();
  const { data: snapshots } = usePortfolioSnapshots();
  const recordSnapshot = useRecordSnapshot();
  const snapshotFired = useRef(false);

  const tickers = holdings?.map((h) => h.ticker) ?? [];
  const { data: quotes } = useQuotes(tickers);

  const totalValue =
    holdings?.reduce((sum, h) => sum + h.quantity * (quotes?.[h.ticker]?.c ?? h.avgCost), 0) ?? 0;
  const totalCost = holdings?.reduce((sum, h) => sum + h.quantity * h.avgCost, 0) ?? 0;
  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  useEffect(() => {
    if (snapshotFired.current) return;
    if (!holdings || !quotes) return;
    if (holdings.length > 0 && holdings.some((h) => !quotes[h.ticker])) return;
    snapshotFired.current = true;
    recordSnapshot.mutate(totalValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holdings, quotes]);

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

  const allocation =
    holdings?.map((h) => ({
      ticker: h.ticker,
      value: h.quantity * (quotes?.[h.ticker]?.c ?? h.avgCost),
    })) ?? [];

  if (holdingsError) {
    return (
      <GlassCard className="max-w-md">
        <p className="text-sm text-nobuy">{tc("errorGeneric")}</p>
        <button
          onClick={() => refetchHoldings()}
          className="mt-2 text-xs text-foreground-muted underline hover:text-foreground"
        >
          {tc("retry")}
        </button>
      </GlassCard>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <TransactionForm />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard strong className="md:col-span-2">
          <p className="text-sm text-foreground-muted">{t("totalValue")}</p>
          <div className="mt-1 flex items-baseline gap-3">
            <p className="text-3xl font-semibold tabular-nums">
              {holdingsPending
                ? "—"
                : `$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            </p>
            {!holdingsPending && totalCost > 0 && (
              <span
                className={
                  totalPnl >= 0
                    ? "rounded-full bg-buy-soft px-2.5 py-1 text-sm font-medium text-buy tabular-nums"
                    : "rounded-full bg-nobuy-soft px-2.5 py-1 text-sm font-medium text-nobuy tabular-nums"
                }
              >
                {totalPnl >= 0 ? "+" : ""}
                {totalPnl.toLocaleString(undefined, { maximumFractionDigits: 0 })} (
                {totalPnlPct >= 0 ? "+" : ""}
                {totalPnlPct.toFixed(1)}%)
              </span>
            )}
            {!holdingsPending && totalCost > 0 && (
              <span className="text-xs text-foreground-muted">{t("todayChange")}</span>
            )}
          </div>
          {snapshots && <PortfolioValueChart snapshots={snapshots} />}
        </GlassCard>

        <GlassCard>
          <p className="text-sm text-foreground-muted mb-2">{t("allocation")}</p>
          {allocation.length > 0 ? (
            <AllocationDonut data={allocation} />
          ) : (
            <p className="text-sm text-foreground-muted">{t("emptyHoldings")}</p>
          )}
        </GlassCard>
      </div>

      {holdings && holdings.length > 0 && (
        <div>
          <p className="text-sm text-foreground-muted mb-2">{t("holdings")}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {holdings.map((h) => {
              const price = quotes?.[h.ticker]?.c ?? h.avgCost;
              const pnl = (price - h.avgCost) * h.quantity;
              const pnlPct = h.avgCost > 0 ? ((price - h.avgCost) / h.avgCost) * 100 : 0;
              const positive = pnl >= 0;
              return (
                <Link key={h.id} href={`/asset/${h.ticker}`}>
                  <GlassCard className="flex flex-col gap-2 transition-colors hover:border-white/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{h.ticker}</p>
                        <p className="text-xs text-foreground-muted">
                          {h.quantity} {t("shares")} @ ${h.avgCost.toFixed(2)}
                        </p>
                      </div>
                      <p className="text-sm tabular-nums">
                        ${(price * h.quantity).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <span
                      className={
                        positive
                          ? "w-fit rounded-full bg-buy-soft px-2 py-0.5 text-xs font-medium text-buy tabular-nums"
                          : "w-fit rounded-full bg-nobuy-soft px-2 py-0.5 text-xs font-medium text-nobuy tabular-nums"
                      }
                    >
                      {positive ? "+" : ""}
                      {pnl.toFixed(2)} ({positive ? "+" : ""}
                      {pnlPct.toFixed(1)}%)
                    </span>
                  </GlassCard>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {transactions && (
        <div>
          <p className="text-sm text-foreground-muted mb-2">{t("history")}</p>
          {transactions.length === 0 ? (
            <GlassCard>
              <p className="text-sm text-foreground-muted">{t("emptyTransactions")}</p>
            </GlassCard>
          ) : (
          <GlassCard className="!p-0 overflow-hidden">
            <div className="divide-y divide-border-subtle">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        tx.side === "buy"
                          ? "rounded-full bg-buy-soft px-2 py-0.5 text-[11px] text-buy"
                          : "rounded-full bg-nobuy-soft px-2 py-0.5 text-[11px] text-nobuy"
                      }
                    >
                      {tx.side === "buy" ? t("buy") : t("sell")}
                    </span>
                    <span className="font-medium">{tx.ticker}</span>
                    <span className="text-xs text-foreground-muted">
                      {tx.quantity} @ ${tx.price.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-xs text-foreground-muted">
                    {new Date(tx.executedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
          )}
        </div>
      )}
    </div>
  );
}
