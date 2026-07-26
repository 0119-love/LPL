"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/ui/glass-card";
import { BentoGrid, bentoSpan } from "@/components/ui/bento-grid";
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
import { SamplePreview } from "@/components/dashboard/sample-preview";
import { AllocationDonut } from "@/components/asset/allocation-donut";
import { PortfolioValueChart } from "@/components/asset/portfolio-value-chart";

const SAMPLE_HOLDINGS = [
  { ticker: "NVDA", quantity: 12, avgCost: 150.2, price: 187.42 },
  { ticker: "TSLA", quantity: 8, avgCost: 260.0, price: 241.08 },
];

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
      <SamplePreview message={t("loginRequired")} cta={t("loginCta")}>
        <BentoGrid>
          <GlassCard strong className={`flex flex-col justify-center ${bentoSpan("hero")}`}>
            <p className="text-sm text-foreground-muted">{t("totalValue")}</p>
            <div className="mt-1 flex items-baseline gap-3">
              <p className="text-3xl font-semibold tabular-nums">$84,210.55</p>
              <span className="rounded-full bg-buy-soft px-2.5 py-1 text-sm font-medium text-buy tabular-nums">
                +3,120 (+3.9%)
              </span>
            </div>
          </GlassCard>

          {SAMPLE_HOLDINGS.map((h, i) => {
            const pnl = (h.price - h.avgCost) * h.quantity;
            const pnlPct = ((h.price - h.avgCost) / h.avgCost) * 100;
            const positive = pnl >= 0;
            return (
              <GlassCard key={h.ticker} className={`flex flex-col gap-2 justify-center ${bentoSpan(i === 0 ? "wide" : "small")}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{h.ticker}</p>
                    <p className="text-xs text-foreground-muted">
                      {h.quantity} {t("shares")} @ ${h.avgCost.toFixed(2)}
                    </p>
                  </div>
                  <p className="text-sm tabular-nums">
                    ${(h.price * h.quantity).toLocaleString(undefined, { maximumFractionDigits: 0 })}
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
            );
          })}
        </BentoGrid>
      </SamplePreview>
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

      <BentoGrid>
        <GlassCard strong className={`flex flex-col ${bentoSpan("hero")}`}>
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

        <GlassCard className={bentoSpan("wide")}>
          <p className="text-sm text-foreground-muted mb-2">{t("allocation")}</p>
          {allocation.length > 0 ? (
            <AllocationDonut data={allocation} />
          ) : (
            <p className="text-sm text-foreground-muted">{t("emptyHoldings")}</p>
          )}
        </GlassCard>

        {holdings?.map((h, i) => {
          const price = quotes?.[h.ticker]?.c ?? h.avgCost;
          const pnl = (price - h.avgCost) * h.quantity;
          const pnlPct = h.avgCost > 0 ? ((price - h.avgCost) / h.avgCost) * 100 : 0;
          const positive = pnl >= 0;
          return (
            <Link key={h.id} href={`/asset/${h.ticker}`} className={bentoSpan(i === 0 ? "wide" : "small")}>
              <GlassCard className="flex h-full flex-col justify-center gap-2 transition-colors hover:border-white/20">
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
      </BentoGrid>

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
