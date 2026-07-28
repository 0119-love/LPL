"use client";

import { Panel } from "../ui/panel";
import { Link } from "@/i18n/navigation";
import { useUser } from "@/lib/supabase/use-user";
import { usePortfolioHoldings } from "@/lib/queries/portfolio-queries";
import { useQuotes } from "@/lib/queries/market-queries";

export function PositionsSection() {
  const { user, loading: userLoading } = useUser();
  const { data: holdings } = usePortfolioHoldings();
  const tickers = holdings?.map((h) => h.ticker) ?? [];
  const { data: quotes } = useQuotes(tickers);

  return (
    <Panel id="section-positions" eyebrow="Positions" meta={user ? "Live" : undefined} noPadding>
      {!userLoading && !user && (
        <div className="px-4 py-6 text-center">
          <p className="text-[12px] text-[var(--term-text-dim)]">Log in to see your positions.</p>
          <Link href="/login" className="mt-2 inline-block text-[12px] font-medium text-[var(--term-buy)] hover:opacity-80">
            Log in
          </Link>
        </div>
      )}

      {user && holdings && holdings.length === 0 && (
        <p className="px-4 py-6 text-center text-[12px] text-[var(--term-text-dim)]">
          No open positions yet.
        </p>
      )}

      {user && holdings && holdings.length > 0 && (
        <>
          <div className="grid grid-cols-[1fr_70px_80px_80px_90px] gap-2 border-b border-[var(--term-border)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--term-text-dim)]">
            <span>Ticker</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Avg Cost</span>
            <span className="text-right">Price</span>
            <span className="text-right">P&amp;L</span>
          </div>
          <div className="divide-y divide-[var(--term-border)]">
            {holdings.map((h) => {
              const price = quotes?.[h.ticker]?.c ?? h.avgCost;
              const marketValue = h.quantity * price;
              const costBasis = h.quantity * h.avgCost;
              const pnl = marketValue - costBasis;
              const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
              const positive = pnl >= 0;
              return (
                <Link
                  key={h.id}
                  href={`/asset/${h.ticker}`}
                  className="grid grid-cols-[1fr_70px_80px_80px_90px] items-center gap-2 px-4 py-2.5 text-[12px] hover:bg-white/[0.03] transition-colors"
                >
                  <span className="font-semibold truncate">{h.ticker}</span>
                  <span className="term-mono text-right text-[var(--term-text-mid)]">{h.quantity}</span>
                  <span className="term-mono text-right text-[var(--term-text-mid)]">${h.avgCost.toFixed(2)}</span>
                  <span className="term-mono text-right">${price.toFixed(2)}</span>
                  <span className={`term-mono text-right font-medium ${positive ? "text-[var(--term-buy)]" : "text-[var(--term-nobuy)]"}`}>
                    {positive ? "+" : ""}
                    {pnlPct.toFixed(1)}%
                  </span>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </Panel>
  );
}
