import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type SidebarNavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export type SidebarNavGroup = {
  title?: string;
  items: SidebarNavItem[];
};

export function Sidebar({
  brand,
  groups,
  activeId,
  onSelect,
  footer,
  width = 240,
}: {
  brand: ReactNode;
  groups: SidebarNavGroup[];
  activeId: string;
  onSelect: (id: string) => void;
  footer?: ReactNode;
  width?: number;
}) {
  return (
    <aside
      className="hidden lg:flex shrink-0 flex-col border-r border-[var(--term-border)] bg-[var(--term-panel)]"
      style={{ width }}
    >
      <div className="flex items-center gap-2.5 px-5 py-5">{brand}</div>

      <nav className="flex-1 px-3 py-1 space-y-4 overflow-y-auto term-scrollbar">
        {groups.map((group, groupIndex) => (
          <div key={groupIndex}>
            {group.title && (
              <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--term-text-dim)]">
                {group.title}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className={`group relative flex w-full items-center gap-2.5 rounded-md px-3 py-[7px] text-[13px] transition-colors ${
                      isActive
                        ? "bg-white/[0.06] text-[var(--term-text)]"
                        : "text-[var(--term-text-mid)] hover:bg-white/[0.03] hover:text-[var(--term-text)]"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-[var(--term-buy)]" />
                    )}
                    <Icon size={15} strokeWidth={1.75} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {footer}
    </aside>
  );
}
