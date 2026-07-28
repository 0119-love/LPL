"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useSymbolSearch } from "@/lib/queries/market-queries";

export function CommandSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [raw, setRaw] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const { data, isFetching } = useSymbolSearch(query);

  useEffect(() => {
    const id = setTimeout(() => setQuery(raw.trim()), 300);
    return () => clearTimeout(id);
  }, [raw]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const results = (data?.result ?? [])
    .filter((r) => r.type === "Common Stock" || r.type === "ETP")
    .slice(0, 8);

  function goToTicker(symbol: string) {
    router.push(`/asset/${symbol}`);
    setRaw("");
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  }

  function onKeyDownInput(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      goToTicker(results[highlighted].symbol);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div className="relative">
      <Search
        size={14}
        strokeWidth={1.75}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--term-text-dim)]"
      />
      <input
        ref={inputRef}
        value={raw}
        onChange={(e) => {
          setRaw(e.target.value);
          setHighlighted(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={onKeyDownInput}
        type="text"
        placeholder="Search ticker or company..."
        className="w-full rounded-md border border-[var(--term-border)] bg-white/[0.03] py-2 pl-9 pr-14 text-[12.5px] text-[var(--term-text)] placeholder:text-[var(--term-text-dim)] outline-none transition-colors focus:border-[var(--term-border-strong)] focus:bg-white/[0.05]"
      />
      <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-[var(--term-border)] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-[var(--term-text-dim)]">
        ⌘K
      </kbd>

      {open && query && (
        <div className="absolute z-20 mt-1.5 w-full max-h-80 overflow-y-auto rounded-lg border border-[var(--term-border)] bg-[var(--term-panel-elevated)] shadow-xl term-scrollbar">
          {isFetching && <p className="px-3 py-2.5 text-[12px] text-[var(--term-text-dim)]">Searching…</p>}
          {!isFetching && results.length === 0 && (
            <p className="px-3 py-2.5 text-[12px] text-[var(--term-text-dim)]">No matches for &ldquo;{query}&rdquo;</p>
          )}
          {results.map((r, i) => (
            <button
              key={r.symbol}
              onMouseDown={(e) => {
                e.preventDefault();
                goToTicker(r.symbol);
              }}
              onMouseEnter={() => setHighlighted(i)}
              className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[12.5px] transition-colors ${
                i === highlighted ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
              }`}
            >
              <span className="min-w-0">
                <span className="font-semibold">{r.symbol}</span>
                <span className="ml-2 truncate text-[11px] text-[var(--term-text-dim)]">{r.description}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
