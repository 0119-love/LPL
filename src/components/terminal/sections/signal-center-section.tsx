"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Panel } from "../ui/panel";
import { SignalBadge } from "../ui/signal-badge";
import { Link } from "@/i18n/navigation";
import { useUser } from "@/lib/supabase/use-user";
import { useQuotes, useSymbolSearch } from "@/lib/queries/market-queries";
import {
  useAlertRules,
  useCreateAlertRule,
  useDeleteAlertRule,
} from "@/lib/queries/terminal-queries";
import type { AlertCondition } from "@/lib/supabase/alert-rules";

function AddRuleForm() {
  const [raw, setRaw] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<{ ticker: string; name: string } | null>(null);
  const [condition, setCondition] = useState<AlertCondition>("price_above");
  const [threshold, setThreshold] = useState("");
  const { data } = useSymbolSearch(query);
  const createMutation = useCreateAlertRule();

  useEffect(() => {
    const id = setTimeout(() => setQuery(raw.trim()), 300);
    return () => clearTimeout(id);
  }, [raw]);

  const results = (data?.result ?? []).filter((r) => r.type === "Common Stock").slice(0, 6);
  const canSubmit = !!selected && Number(threshold) > 0 && !createMutation.isPending;

  return (
    <div className="border-b border-[var(--term-border)] p-3">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_100px_auto] gap-2">
        <div className="relative">
          <input
            value={selected ? `${selected.ticker} — ${selected.name}` : raw}
            onChange={(e) => {
              setSelected(null);
              setRaw(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder="Search a ticker…"
            className="w-full rounded-md border border-[var(--term-border)] bg-white/[0.03] px-2.5 py-1.5 text-[12px] outline-none placeholder:text-[var(--term-text-dim)] focus:border-[var(--term-border-strong)]"
          />
          {open && query && !selected && (
            <div className="absolute inset-x-0 z-20 mt-1 max-h-52 overflow-y-auto rounded-lg border border-[var(--term-border)] bg-[var(--term-panel-elevated)] shadow-xl term-scrollbar">
              {results.length === 0 && <p className="px-3 py-2 text-[11.5px] text-[var(--term-text-dim)]">No matches</p>}
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
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[12px] hover:bg-white/[0.05] transition-colors"
                >
                  <span className="font-semibold">{r.symbol}</span>
                  <span className="truncate text-[11px] text-[var(--term-text-dim)]">{r.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex overflow-hidden rounded-md border border-[var(--term-border)] text-[11px]">
          <button
            onClick={() => setCondition("price_above")}
            className={`px-2.5 py-1.5 ${condition === "price_above" ? "bg-[var(--term-buy)]/15 text-[var(--term-buy)]" : "text-[var(--term-text-dim)]"}`}
          >
            Above
          </button>
          <button
            onClick={() => setCondition("price_below")}
            className={`px-2.5 py-1.5 ${condition === "price_below" ? "bg-[var(--term-nobuy)]/15 text-[var(--term-nobuy)]" : "text-[var(--term-text-dim)]"}`}
          >
            Below
          </button>
        </div>

        <input
          type="number"
          min="0"
          step="any"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          placeholder="Price"
          className="w-full rounded-md border border-[var(--term-border)] bg-white/[0.03] px-2.5 py-1.5 text-[12px] outline-none placeholder:text-[var(--term-text-dim)] focus:border-[var(--term-border-strong)]"
        />

        <button
          disabled={!canSubmit}
          onClick={() =>
            selected &&
            createMutation.mutate(
              { ticker: selected.ticker, name: selected.name, condition, threshold: Number(threshold) },
              { onSuccess: () => { setSelected(null); setThreshold(""); } },
            )
          }
          className="rounded-md bg-[var(--term-buy)] px-3 py-1.5 text-[12px] font-medium text-[#04140b] transition-opacity disabled:opacity-30"
        >
          Add
        </button>
      </div>
    </div>
  );
}

export function SignalCenterSection() {
  const { user, loading: userLoading } = useUser();
  const { data: rules } = useAlertRules();
  const tickers = rules?.map((r) => r.ticker) ?? [];
  const { data: quotes } = useQuotes(tickers);
  const deleteMutation = useDeleteAlertRule();

  return (
    <Panel id="section-signals" eyebrow="Signal Center" meta={user ? "Live" : undefined} noPadding>
      {!userLoading && !user && (
        <div className="px-4 py-6 text-center">
          <p className="text-[12px] text-[var(--term-text-dim)]">Log in to manage signals.</p>
          <Link href="/login" className="mt-2 inline-block text-[12px] font-medium text-[var(--term-buy)] hover:opacity-80">
            Log in
          </Link>
        </div>
      )}

      {user && (
        <>
          <AddRuleForm />
          {rules && rules.length === 0 && (
            <p className="px-4 py-4 text-center text-[12px] text-[var(--term-text-dim)]">
              No signals configured yet.
            </p>
          )}
          <div className="divide-y divide-[var(--term-border)]">
            {rules?.map((rule) => {
              const price = quotes?.[rule.ticker]?.c;
              const triggered =
                price != null &&
                (rule.condition === "price_above" ? price >= rule.threshold : price <= rule.threshold);
              return (
                <div key={rule.id} className="group flex items-center gap-3 px-4 py-2.5">
                  <div className="min-w-0 flex-1">
                    <span className="text-[12.5px] font-semibold">{rule.ticker}</span>
                    <span className="ml-2 text-[11px] text-[var(--term-text-dim)]">
                      {rule.condition === "price_above" ? "Above" : "Below"} ${rule.threshold}
                    </span>
                  </div>
                  <span className="term-mono text-[12px] text-[var(--term-text-mid)]">
                    {price != null ? `$${price.toFixed(2)}` : "—"}
                  </span>
                  <SignalBadge label={triggered ? "TRIGGERED" : "WATCHING"} tone={triggered ? "buy" : "neutral"} size="xs" />
                  <button
                    aria-label={`Remove ${rule.ticker} alert`}
                    onClick={() => deleteMutation.mutate(rule.id)}
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
