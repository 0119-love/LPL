"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useUser } from "@/lib/supabase/use-user";
import { useAlertRuleCount } from "@/lib/queries/terminal-queries";
import { Header } from "./ui/header";
import { StatusIndicator } from "./ui/status-indicator";
import { CommandSearch } from "./command-search";
import { CommandUserMenu } from "./command-user-menu";

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
  const { data: alertRuleCount } = useAlertRuleCount();

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
      center={<CommandSearch />}
      actions={
        <>
          <StatusIndicator label="LIVE" tone="buy" pulse pill className="hidden sm:inline-flex" />

          <button
            aria-label="notifications"
            title={alertRuleCount ? `${alertRuleCount} price alerts configured` : undefined}
            className="relative flex h-8 w-8 items-center justify-center rounded-md text-[var(--term-text-mid)] transition-colors hover:bg-white/[0.05] hover:text-[var(--term-text)]"
          >
            <Bell size={16} strokeWidth={1.75} />
            {!!alertRuleCount && alertRuleCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--term-nobuy)] px-1 text-[9.5px] font-semibold text-white">
                {alertRuleCount}
              </span>
            )}
          </button>

          <CommandUserMenu />
        </>
      }
    />
  );
}
