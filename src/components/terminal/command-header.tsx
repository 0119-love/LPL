"use client";

import { useEffect, useState } from "react";
import { Search, Bell, ChevronDown } from "lucide-react";
import { useUser } from "@/lib/supabase/use-user";
import { intelligenceFeed } from "@/lib/terminal/mock-data";
import { Header } from "./ui/header";
import { StatusIndicator } from "./ui/status-indicator";

function greetingFor(hour: number) {
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

export function CommandHeader() {
  const { user } = useUser();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const displayName = user?.email?.split("@")[0] ?? "Investor";
  const capitalized = displayName.charAt(0).toUpperCase() + displayName.slice(1);

  return (
    <Header
      title={`${greetingFor(now?.getHours() ?? 9)}, ${capitalized}`}
      subtitle={
        now
          ? now.toLocaleString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          : " "
      }
      center={
        <div className="relative">
          <Search
            size={14}
            strokeWidth={1.75}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--term-text-dim)]"
          />
          <input
            type="text"
            placeholder="Search ticker, sector, analyst, report..."
            className="w-full rounded-md border border-[var(--term-border)] bg-white/[0.03] py-2 pl-9 pr-14 text-[12.5px] text-[var(--term-text)] placeholder:text-[var(--term-text-dim)] outline-none transition-colors focus:border-[var(--term-border-strong)] focus:bg-white/[0.05]"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-[var(--term-border)] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-[var(--term-text-dim)]">
            ⌘K
          </kbd>
        </div>
      }
      actions={
        <>
          <StatusIndicator label="LIVE" tone="buy" pulse pill className="hidden sm:inline-flex" />

          <button
            aria-label="notifications"
            className="relative flex h-8 w-8 items-center justify-center rounded-md text-[var(--term-text-mid)] transition-colors hover:bg-white/[0.05] hover:text-[var(--term-text)]"
          >
            <Bell size={16} strokeWidth={1.75} />
            {intelligenceFeed.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--term-nobuy)] px-1 text-[9.5px] font-semibold text-white">
                {intelligenceFeed.length}
              </span>
            )}
          </button>

          <button className="flex items-center gap-2 rounded-md border border-[var(--term-border)] bg-white/[0.03] py-1 pl-1 pr-2 hover:bg-white/[0.05] transition-colors">
            <div className="grid h-6 w-6 shrink-0 place-items-center rounded bg-[var(--term-buy)]/15 text-[11px] font-medium text-[var(--term-buy)]">
              {capitalized[0]}
            </div>
            <span className="hidden sm:flex flex-col items-start leading-none">
              <span className="text-[12px] font-medium">{capitalized}</span>
              <span className="mt-0.5 text-[9.5px] text-[var(--term-text-dim)]">Pro Plan</span>
            </span>
            <ChevronDown size={13} strokeWidth={2} className="hidden sm:block text-[var(--term-text-dim)]" />
          </button>
        </>
      }
    />
  );
}
