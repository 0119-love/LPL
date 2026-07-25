"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Sidebar } from "./sidebar";
import { MobileTabBar } from "./mobile-tab-bar";
import { MarketTab } from "./tabs/market-tab";
import { CommitteeTab } from "./tabs/committee-tab";
import { PortfolioTab } from "./tabs/portfolio-tab";
import { AlertsTab } from "./tabs/alerts-tab";
import { prefetchDashboard } from "@/lib/queries/dashboard-queries";

export type DashboardTab = "market" | "committee" | "portfolio" | "alerts";

export function DashboardShell() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("market");
  const [collapsed, setCollapsed] = useState(false);
  const queryClient = useQueryClient();
  const t = useTranslations("Dashboard.tabs");

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
        <header className="flex items-center justify-between border-b border-border-subtle px-4 md:px-6 py-3 shrink-0">
          <h1 className="text-sm font-medium text-foreground-muted">
            {t(activeTab)}
          </h1>
          <span className="flex items-center gap-1.5 text-xs text-buy">
            <span className="h-1.5 w-1.5 rounded-full bg-buy animate-pulse" />
            LIVE
          </span>
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
