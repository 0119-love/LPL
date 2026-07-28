"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Panel } from "../ui/panel";
import { Link } from "@/i18n/navigation";
import { useUser } from "@/lib/supabase/use-user";
import {
  useAddToWatchlist,
  useQuotes,
  useRemoveFromWatchlist,
  useSymbolSearch,
  useWatchlist,
} from "@/lib/queries/market-queries";

function AddTickerBox() {
  const [raw, setRaw] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { data } = useSymbolSearch(query);
  const addMutation = useAddToWatchlist();

  useEffect(() => {
    const id = setTimeout(() => setQuery(raw.trim()), 300);
    return () => clearTimeout(id);
  }, [raw]);

  const results = (data?.result ?? []).filter((r) => r.type === "Common Stock").slice(0, 6);

  return (
    <div className="relative border-b border-[var(--term-border)] p-3">
      <div className="relative">
        <Search size={13} strokeWidth={1.75} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--term-text-dim)]" />
        <input
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Add a ticker to your watchlist…"
          className="w-full rounded-md border border-[var(--term-border)] bg-white/[0.03] py-1.5 pl-8 pr-3 text-[12px] outline-none placeholder:text-[var(--term-text-dim)] focus:border-[var(--term-border-strong)]"
        />
      </div>

      {open && query && (
        <div className="absolute inset-x-3 z-20 mt-1 max-h-56 overflow-y-auto rounded-lg border border-[var(--term-border)] bg-[var(--term-panel-elevated)] shadow-xl term-scrollbar">
          {results.length === 0 && (
            <p className="px-3 py-2 text-[11.5px] text-[var(--term-text-dim)]">No matches</p>
          )}
          {results.map((r) => (
            <button
              key={r.symbol}
              onMouseDown={(e) => {
                e.preventDefault();
                addMutation.mutate({ ticker: r.symbol, name: r.description });
                setRaw("");
                setQuery("");
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[12px] hover:bg-white/[0.05] transition-colors"
            >
              <span>
                <span className="font-semibold">{r.symbol}</span>
                <span className="ml-2 truncate text-[11px] text-[var(--term-text-dim)]">{r.description}</span>
              </span>
              <span className="shrink-0 text-[10.5px] text-[var(--term-buy)]">Add</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function WatchlistSection() {
  const { user, loading: userLoading } = useUser();
  const { data: items } = useWatchlist();
  const tickers = items?.map((i) => i.ticker) ?? [];
  const { data: quotes } = useQuotes(tickers);
  const removeMutation = useRemoveFromWatchlist();

  return (
    <Panel id="section-watchlist" eyebrow="Watchlist" meta={user ? "Live" : undefined} noPadding>
      {!userLoading && !user && (
        <div className="px-4 py-6 text-center">
          <p className="text-[12px] text-[var(--term-text-dim)]">Log in to build a watchlist.</p>
          <Link href="/login" className="mt-2 inline-block text-[12px] font-medium text-[var(--term-buy)] hover:opacity-80">
            Log in
          </Link>
        </div>
      )}

      {user && (
        <>
          <AddTickerBox />
          {items && items.length === 0 && (
            <p className="px-4 py-4 text-center text-[12px] text-[var(--term-text-dim)]">
              No tickers yet — add one above.
            </p>
          )}
          <div className="divide-y divide-[var(--term-border)]">
            {items?.map((item) => {
              const q = quotes?.[item.ticker];
              const positive = (q?.dp ?? 0) >= 0;
              return (
                <div key={item.watchlistId} className="group flex items-center gap-3 px-4 py-2.5">
                  <Link href={`/asset/${item.ticker}`} className="min-w-0 flex-1 hover:opacity-80">
                    <span className="text-[12.5px] font-semibold">{item.ticker}</span>
                    <span className="ml-2 truncate text-[11px] text-[var(--term-text-dim)]">{item.name}</span>
                  </Link>
                  {q && (
                    <>
                      <span className="term-mono text-[12px] text-[var(--term-text-mid)]">{q.c.toFixed(2)}</span>
                      <span className={`term-mono w-16 shrink-0 text-right text-[12px] font-medium ${positive ? "text-[var(--term-buy)]" : "text-[var(--term-nobuy)]"}`}>
                        {positive ? "+" : ""}
                        {q.dp.toFixed(2)}%
                      </span>
                    </>
                  )}
                  <button
                    aria-label={`Remove ${item.ticker}`}
                    onClick={() => removeMutation.mutate(item.watchlistId)}
                    className="shrink-0 text-[var(--term-text-dim)] opacity-0 transition-opacity hover:text-[var(--term-nobuy)] group-hover:opacity-100"
                  >
                    <X size={14} strokeWidth={1.75} />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Panel>
  );
}
