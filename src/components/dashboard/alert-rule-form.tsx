"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { useTranslations } from "next-intl";
import { useSymbolSearch } from "@/lib/queries/market-queries";
import { useCreateAlertRule } from "@/lib/queries/alert-rules-queries";
import type { AlertCondition } from "@/lib/supabase/alert-rules";

export function AlertRuleForm() {
  const t = useTranslations("Dashboard.alerts");
  const tm = useTranslations("Dashboard.market");
  const tc = useTranslations("Common");
  const [raw, setRaw] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<{ ticker: string; name: string } | null>(null);
  const [condition, setCondition] = useState<AlertCondition>("price_above");
  const [threshold, setThreshold] = useState("");

  const { data, isFetching } = useSymbolSearch(query);
  const mutation = useCreateAlertRule();

  useEffect(() => {
    const id = setTimeout(() => setQuery(raw.trim()), 300);
    return () => clearTimeout(id);
  }, [raw]);

  const results = (data?.result ?? []).filter((r) => r.type === "Common Stock").slice(0, 8);
  const canSubmit = selected && Number(threshold) > 0 && !mutation.isPending;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <div className="relative md:col-span-2">
        <input
          value={selected ? `${selected.ticker} — ${selected.name}` : raw}
          onChange={(e) => {
            setSelected(null);
            setRaw(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={tm("searchPlaceholder")}
          aria-label={tm("searchPlaceholder")}
          className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2 text-sm outline-none transition-shadow focus:border-foreground-muted focus:ring-1 focus:ring-white/10 placeholder:text-foreground-muted"
        />
        {open && query && !selected && (
          <div className="absolute z-10 mt-1.5 w-full max-h-56 overflow-y-auto rounded-lg border border-border-subtle bg-background-elevated shadow-xl">
            {isFetching && <p className="px-3 py-2 text-xs text-foreground-muted">…</p>}
            {!isFetching && results.length === 0 && (
              <p className="px-3 py-2 text-xs text-foreground-muted">{tm("noResults")}</p>
            )}
            {results.map((r) => (
              <button
                key={r.symbol}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setSelected({ ticker: r.symbol, name: r.description });
                  setRaw("");
                  setQuery("");
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-white/5"
              >
                <span className="font-medium">{r.symbol}</span>
                <span className="ml-2 truncate text-xs text-foreground-muted">{r.description}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex rounded-lg border border-border-subtle overflow-hidden text-xs">
        <button
          onClick={() => setCondition("price_above")}
          className={clsx(
            "flex-1 py-2 px-1",
            condition === "price_above" ? "bg-buy-soft text-buy" : "text-foreground-muted",
          )}
        >
          {t("priceAbove")}
        </button>
        <button
          onClick={() => setCondition("price_below")}
          className={clsx(
            "flex-1 py-2 px-1",
            condition === "price_below" ? "bg-nobuy-soft text-nobuy" : "text-foreground-muted",
          )}
        >
          {t("priceBelow")}
        </button>
      </div>

      <div className="flex gap-2">
        <input
          type="number"
          min="0"
          step="any"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          placeholder={t("threshold")}
          aria-label={t("threshold")}
          className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2 text-sm outline-none transition-shadow focus:border-foreground-muted focus:ring-1 focus:ring-white/10 placeholder:text-foreground-muted"
        />
      </div>

      <button
        disabled={!canSubmit}
        onClick={() => {
          if (!selected) return;
          mutation.mutate(
            { ticker: selected.ticker, name: selected.name, condition, threshold: Number(threshold) },
            {
              onSuccess: () => {
                setSelected(null);
                setThreshold("");
              },
            },
          );
        }}
        className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-40 md:col-span-4"
      >
        {t("createRule")}
      </button>

      {mutation.isError && (
        <p className="text-xs text-nobuy md:col-span-4">{tc("errorGeneric")}</p>
      )}
    </div>
  );
}
