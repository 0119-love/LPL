import type { ReactNode } from "react";

export function SectionHeader({
  eyebrow,
  meta,
  bordered = true,
  className = "",
}: {
  eyebrow: ReactNode;
  meta?: ReactNode;
  bordered?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 ${bordered ? "term-panel-head" : "pb-1"} ${className}`}
    >
      <span className="term-eyebrow">{eyebrow}</span>
      {meta != null && (
        <span className="term-mono text-[10.5px] text-[var(--term-text-dim)]">{meta}</span>
      )}
    </div>
  );
}
