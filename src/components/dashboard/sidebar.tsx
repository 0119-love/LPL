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
          <div className="h-7 w-7 shrink-0 rounded-md bg-foreground text-background grid place-items-center text-xs font-bold shadow-[0_0_16px_rgba(245,245,244,0.25)]">
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
                  "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  collapsed && "justify-center px-0",
                  active
                    ? "bg-white/[0.07] text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                    : "text-foreground-muted hover:text-foreground hover:bg-white/5",
                )}
                aria-current={active}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-4 -translate-y-1/2 w-0.5 rounded-full bg-buy shadow-[0_0_6px_var(--accent-buy)]" />
                )}
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
