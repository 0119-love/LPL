import type { ReactNode } from "react";

export function Header({
  title,
  subtitle,
  center,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  center?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-[var(--term-border)] bg-[var(--term-panel)] px-5 py-3.5">
      <div className="min-w-0">
        <h1 className="text-[15px] font-semibold tracking-tight">{title}</h1>
        {subtitle != null && (
          <p className="term-mono text-[11px] text-[var(--term-text-dim)]">{subtitle}</p>
        )}
      </div>

      {center != null && <div className="hidden md:block w-full max-w-sm">{center}</div>}

      {actions != null && <div className="flex shrink-0 items-center gap-2.5">{actions}</div>}
    </header>
  );
}
