"use client";

import { clsx } from "clsx";
import { LineChart, Gavel, Wallet, Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import type { DashboardTab } from "./dashboard-shell";

const NAV_ITEMS: { tab: DashboardTab; icon: typeof LineChart }[] = [
  { tab: "market", icon: LineChart },
  { tab: "committee", icon: Gavel },
  { tab: "portfolio", icon: Wallet },
  { tab: "alerts", icon: Bell },
];

export function MobileTabBar({
  activeTab,
  onSelect,
}: {
  activeTab: DashboardTab;
  onSelect: (tab: DashboardTab) => void;
}) {
  const t = useTranslations("Dashboard.tabs");

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 flex items-stretch justify-around border-t border-border-subtle bg-background-elevated/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      {NAV_ITEMS.map(({ tab, icon: Icon }) => {
        const active = tab === activeTab;
        return (
          <button
            key={tab}
            onClick={() => onSelect(tab)}
            className={clsx(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px]",
              active ? "text-foreground" : "text-foreground-muted",
            )}
          >
            <Icon size={20} strokeWidth={1.75} />
            {t(tab)}
          </button>
        );
      })}
    </nav>
  );
}
