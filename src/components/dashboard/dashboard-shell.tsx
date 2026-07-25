"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Bell } from "lucide-react";
import { Sidebar } from "./sidebar";
import { MobileTabBar } from "./mobile-tab-bar";
import { MarketTab } from "./tabs/market-tab";
import { CommitteeTab } from "./tabs/committee-tab";
import { PortfolioTab } from "./tabs/portfolio-tab";
import { AlertsTab } from "./tabs/alerts-tab";
import { prefetchDashboard, useAlerts } from "@/lib/queries/dashboard-queries";
import { useUser } from "@/lib/supabase/use-user";
import { ReadAlertsProvider, useReadAlerts } from "@/lib/use-read-alerts";

export type DashboardTab = "market" | "committee" | "portfolio" | "alerts";

export function DashboardShell() {
  return (
    <ReadAlertsProvider>
      <DashboardShellInner />
    </ReadAlertsProvider>
  );
}

function DashboardShellInner() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("market");
  const [collapsed, setCollapsed] = useState(false);
  const queryClient = useQueryClient();
  const t = useTranslations("Dashboard.tabs");
  const { data: alerts } = useAlerts();
  const { readIds } = useReadAlerts();
  const unreadCount = alerts?.filter((a) => !readIds.has(a.id)).length ?? 0;
  const { user } = useUser();

  // Warm the cache for every tab up front so switching never re-fetches or blocks.
  useEffect(() => {
    prefetchDashboard(queryClient);
  }, [queryClient]);

  return (
    <div className="flex h-dvh w-full bg-background">
      <Sidebar
        activeTab={activeTab}
        onSelect={setActiveTab}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((v) => !v)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between border-b border-border-subtle bg-background-elevated/60 backdrop-blur px-4 md:px-6 py-3.5 shrink-0">
          <h1 className="text-base md:text-lg font-semibold tracking-tight">
            {t(activeTab)}
          </h1>

          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 rounded-full border border-border-subtle bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-buy">
              <span className="h-1.5 w-1.5 rounded-full bg-buy shadow-[0_0_6px_var(--accent-buy)] animate-pulse" />
              LIVE
            </span>

            <button
              onClick={() => setActiveTab("alerts")}
              className="relative flex h-8 w-8 items-center justify-center rounded-full text-foreground-muted transition-colors hover:bg-white/5 hover:text-foreground"
              aria-label="alerts"
            >
              <Bell size={17} strokeWidth={1.75} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-nobuy px-1 text-[10px] font-semibold text-background">
                  {unreadCount}
                </span>
              )}
            </button>

            {user && (
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-medium">
                {user.email?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-5 pb-20 md:pb-5">
          <div key={activeTab} className="animate-[fadeIn_120ms_ease-out]">
            {activeTab === "market" && <MarketTab />}
            {activeTab === "committee" && <CommitteeTab />}
            {activeTab === "portfolio" && <PortfolioTab />}
            {activeTab === "alerts" && <AlertsTab />}
          </div>
        </main>
      </div>

      <MobileTabBar activeTab={activeTab} onSelect={setActiveTab} />
    </div>
  );
}
