"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { useTranslations } from "next-intl";
import { useSymbolSearch } from "@/lib/queries/market-queries";
import { useRecordTransaction } from "@/lib/queries/portfolio-queries";
import { GlassCard } from "@/components/ui/glass-card";

export function TransactionForm() {
  const t = useTranslations("Dashboard.portfolio");
  const tm = useTranslations("Dashboard.market");
  const [raw, setRaw] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<{ ticker: string; name: string } | null>(null);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const { data, isFetching } = useSymbolSearch(query);
  const mutation = useRecordTransaction();

  useEffect(() => {
    const id = setTimeout(() => setQuery(raw.trim()), 300);
    return () => clearTimeout(id);
  }, [raw]);

  const results = (data?.result ?? []).filter((r) => r.type === "Common Stock").slice(0, 8);

  const canSubmit =
    selected && Number(quantity) > 0 && Number(price) >= 0 && !mutation.isPending;

  return (
    <GlassCard>
      <p className="text-sm font-medium mb-3">{t("addTransaction")}</p>
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
            className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2 text-sm outline-none placeholder:text-foreground-muted"
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

        <div className="flex rounded-lg border border-border-subtle overflow-hidden text-sm">
          <button
            onClick={() => setSide("buy")}
            className={clsx("flex-1 py-2", side === "buy" ? "bg-buy-soft text-buy" : "text-foreground-muted")}
          >
            {t("buy")}
          </button>
          <button
            onClick={() => setSide("sell")}
            className={clsx("flex-1 py-2", side === "sell" ? "bg-nobuy-soft text-nobuy" : "text-foreground-muted")}
          >
            {t("sell")}
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder={t("quantity")}
            className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2 text-sm outline-none placeholder:text-foreground-muted"
          />
        </div>

        <input
          type="number"
          min="0"
          step="any"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder={t("price")}
          className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2 text-sm outline-none placeholder:text-foreground-muted md:col-span-2"
        />

        <button
          disabled={!canSubmit}
          onClick={() => {
            if (!selected) return;
            mutation.mutate(
              {
                ticker: selected.ticker,
                name: selected.name,
                side,
                quantity: Number(quantity),
                price: Number(price),
              },
              {
                onSuccess: () => {
                  setSelected(null);
                  setQuantity("");
                  setPrice("");
                },
              },
            );
          }}
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-40 md:col-span-2"
        >
          {t("record")}
        </button>
      </div>
    </GlassCard>
  );
}
