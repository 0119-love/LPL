"use client";

import { clsx } from "clsx";
import {
  LineChart,
  Gavel,
  Wallet,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { DashboardTab } from "./dashboard-shell";

const NAV_ITEMS: { tab: DashboardTab; icon: typeof LineChart }[] = [
  { tab: "market", icon: LineChart },
  { tab: "committee", icon: Gavel },
  { tab: "portfolio", icon: Wallet },
  { tab: "alerts", icon: Bell },
];

export function Sidebar({
  activeTab,
  onSelect,
  collapsed,
  onToggleCollapsed,
}: {
  activeTab: DashboardTab;
  onSelect: (tab: DashboardTab) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  const t = useTranslations("Dashboard.tabs");
  const tSidebar = useTranslations("Dashboard.sidebar");
  const tCommon = useTranslations("Common");

  return (
    <aside
      className={clsx(
        "hidden md:flex flex-col justify-between border-r border-border-subtle bg-background-elevated py-4 transition-[width] duration-150 ease-out",
        collapsed ? "w-[68px]" : "w-56",
      )}
    >
      <div>
        <div
          className={clsx(
            "flex items-center gap-2 px-4 mb-6",
            collapsed && "justify-center px-0",
          )}
        >
          <div className="h-7 w-7 shrink-0 rounded-md bg-foreground text-background grid place-items-center text-xs font-bold">
            V
          </div>
          {!collapsed && (
            <span className="font-semibold text-sm">{tCommon("brand")}</span>
          )}
        </div>

        <nav className="flex flex-col gap-1 px-2">
          {NAV_ITEMS.map(({ tab, icon: Icon }) => {
            const active = tab === activeTab;
            return (
              <button
                key={tab}
                onClick={() => onSelect(tab)}
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  collapsed && "justify-center px-0",
                  active
                    ? "bg-white/10 text-foreground"
                    : "text-foreground-muted hover:text-foreground hover:bg-white/5",
                )}
                aria-current={active}
              >
                <Icon size={18} strokeWidth={1.75} />
                {!collapsed && <span>{t(tab)}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="px-2">
        <button
          onClick={onToggleCollapsed}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground-muted hover:text-foreground hover:bg-white/5 w-full"
        >
          {collapsed ? (
            <PanelLeftOpen size={18} strokeWidth={1.75} />
          ) : (
            <PanelLeftClose size={18} strokeWidth={1.75} />
          )}
          {!collapsed && <span>{tSidebar("collapse")}</span>}
        </button>
      </div>
    </aside>
  );
}
