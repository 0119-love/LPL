"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Search } from "lucide-react";
import { useAddToWatchlist, useSymbolSearch } from "@/lib/queries/market-queries";

export function AssetSearch() {
  const t = useTranslations("Dashboard.market");
  const [raw, setRaw] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { data, isFetching } = useSymbolSearch(query);
  const addMutation = useAddToWatchlist();

  useEffect(() => {
    const id = setTimeout(() => setQuery(raw.trim()), 300);
    return () => clearTimeout(id);
  }, [raw]);

  const results = (data?.result ?? [])
    .filter((r) => r.type === "Common Stock")
    .slice(0, 8);

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-background px-3 py-2">
        <Search size={16} className="text-foreground-muted shrink-0" />
        <input
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={t("searchPlaceholder")}
          className="w-full bg-transparent text-sm outline-none placeholder:text-foreground-muted"
        />
      </div>

      {open && query && (
        <div className="absolute z-10 mt-1.5 w-full max-h-72 overflow-y-auto rounded-lg border border-border-subtle bg-background-elevated shadow-xl">
          {isFetching && (
            <p className="px-3 py-2 text-xs text-foreground-muted">…</p>
          )}
          {!isFetching && results.length === 0 && (
            <p className="px-3 py-2 text-xs text-foreground-muted">
              {t("noResults")}
            </p>
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
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-white/5"
            >
              <span className="min-w-0">
                <span className="font-medium">{r.symbol}</span>
                <span className="ml-2 truncate text-xs text-foreground-muted">
                  {r.description}
                </span>
              </span>
              <Plus size={14} className="shrink-0 text-foreground-muted" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
