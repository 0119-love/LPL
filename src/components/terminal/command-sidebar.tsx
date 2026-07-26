"use client";

import { useState } from "react";
import {
  LayoutGrid,
  LineChart,
  Layers,
  Radar,
  Globe2,
  Newspaper,
  Users,
  FlaskConical,
  Rss,
  Wallet,
  Star,
  Briefcase,
  TrendingUp,
  Bell,
  Radio,
  RefreshCw,
} from "lucide-react";
import { Sidebar, type SidebarNavGroup } from "./ui/sidebar";
import { StatusIndicator } from "./ui/status-indicator";
import { sidebarGroups } from "@/lib/terminal/mock-data";

const ICONS: Record<string, SidebarNavGroup["items"][number]["icon"]> = {
  command: LayoutGrid,
  markets: LineChart,
  sectors: Layers,
  assets: Radar,
  map: Globe2,
  intelligence: Newspaper,
  committee: Users,
  research: FlaskConical,
  news: Rss,
  portfolio: Wallet,
  watchlist: Star,
  positions: Briefcase,
  performance: TrendingUp,
  alerts: Bell,
  signals: Radio,
};

const navGroups: SidebarNavGroup[] = sidebarGroups.map((group) => ({
  title: group.title,
  items: group.items.map((item) => ({
    id: item.id,
    label: item.label,
    icon: ICONS[item.id] ?? LayoutGrid,
  })),
}));

export function CommandSidebar() {
  const [active, setActive] = useState("command");

  const handleSelect = (id: string) => {
    setActive(id);
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Sidebar
      activeId={active}
      onSelect={handleSelect}
      groups={navGroups}
      brand={
        <>
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-[6px] bg-[var(--term-buy)] text-[13px] font-bold text-[#04140b]">
            V
          </div>
          <div className="leading-tight">
            <p className="term-mono text-[13px] font-semibold tracking-[0.04em]">VERDICT</p>
            <p className="text-[9.5px] font-medium tracking-[0.14em] text-[var(--term-text-dim)]">
              INTELLIGENCE TERMINAL
            </p>
          </div>
        </>
      }
      footer={
        <div className="m-3 rounded-lg border border-[var(--term-border)] bg-[var(--term-panel-elevated)] p-3.5">
          <div className="flex items-center gap-2.5">
            <span className="term-orb h-2 w-2 shrink-0 rounded-full bg-[var(--term-buy)]" />
            <div className="min-w-0">
              <p className="text-[12.5px] font-medium leading-tight">AI Director</p>
              <StatusIndicator label="Online" tone="buy" size="xs" />
            </div>
          </div>
          <p className="mt-2.5 text-[10.5px] leading-relaxed text-[var(--term-text-dim)]">
            All systems operational
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[var(--term-text-dim)]">
            <RefreshCw size={10} strokeWidth={1.75} />
            Last sync 07:01 PM
          </div>
        </div>
      }
    />
  );
}
