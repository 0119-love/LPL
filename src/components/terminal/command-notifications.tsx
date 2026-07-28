"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useUser } from "@/lib/supabase/use-user";
import { useAlertRules } from "@/lib/queries/terminal-queries";
import { Link } from "@/i18n/navigation";

function describeRule(condition: "price_above" | "price_below", threshold: number) {
  return condition === "price_above" ? `Above $${threshold}` : `Below $${threshold}`;
}

export function CommandNotifications() {
  const { user, loading: userLoading } = useUser();
  const { data: rules } = useAlertRules();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const count = rules?.length ?? 0;

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-label="notifications"
        onClick={() => setOpen((v) => !v)}
        title={count > 0 ? `${count} price alerts configured` : undefined}
        className="relative flex h-8 w-8 items-center justify-center rounded-md text-[var(--term-text-mid)] transition-colors hover:bg-white/[0.05] hover:text-[var(--term-text)]"
      >
        <Bell size={16} strokeWidth={1.75} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--term-nobuy)] px-1 text-[9.5px] font-semibold text-white">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1.5 w-72 overflow-hidden rounded-lg border border-[var(--term-border)] bg-[var(--term-panel-elevated)] shadow-xl">
          <div className="border-b border-[var(--term-border)] px-3 py-2.5">
            <p className="term-eyebrow">Price Alerts</p>
          </div>

          {!userLoading && !user && (
            <div className="px-3 py-4 text-center">
              <p className="text-[12px] text-[var(--term-text-dim)]">Log in to set price alerts.</p>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="mt-2 inline-block text-[12px] font-medium text-[var(--term-buy)] hover:opacity-80"
              >
                Log in
              </Link>
            </div>
          )}

          {user && count === 0 && (
            <p className="px-3 py-4 text-center text-[12px] text-[var(--term-text-dim)]">
              No price alerts configured yet.
            </p>
          )}

          {user && count > 0 && (
            <div className="max-h-72 overflow-y-auto term-scrollbar">
              {rules!.map((rule) => (
                <Link
                  key={rule.id}
                  href={`/asset/${rule.ticker}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-white/[0.05] transition-colors"
                >
                  <span>
                    <span className="text-[12.5px] font-semibold">{rule.ticker}</span>
                    <span className="ml-2 truncate text-[11px] text-[var(--term-text-dim)]">{rule.name}</span>
                  </span>
                  <span className="term-mono shrink-0 text-[11px] text-[var(--term-text-mid)]">
                    {describeRule(rule.condition, rule.threshold)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
