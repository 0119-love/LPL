import type { ReactNode } from "react";
import { SectionHeader } from "./section-header";

export function Panel({
  id,
  eyebrow,
  meta,
  children,
  className = "",
  bodyClassName = "",
  noPadding = false,
}: {
  id?: string;
  eyebrow?: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  noPadding?: boolean;
}) {
  return (
    <section id={id} className={`term-panel rounded-lg flex flex-col ${className}`}>
      {eyebrow != null && <SectionHeader eyebrow={eyebrow} meta={meta} />}
      <div className={`${noPadding ? "" : "p-4"} flex-1 ${bodyClassName}`}>{children}</div>
    </section>
  );
}
