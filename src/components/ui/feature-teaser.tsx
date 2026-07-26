import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

// Like SamplePreview, but for an already-logged-in empty state: no login
// CTA, just a realistic blurred mockup of the feature with a short caption —
// so an empty bento tile reads as "here's what's coming" rather than a bare box.
export function FeatureTeaser({
  icon: Icon,
  label,
  className,
  children,
}: {
  icon: LucideIcon;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-[20px] border border-dashed border-border-subtle",
        className,
      )}
    >
      <div aria-hidden className="pointer-events-none select-none p-4 opacity-40 blur-[1.5px]">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-4 text-center">
        <Icon size={16} strokeWidth={1.75} className="text-foreground-muted" />
        <span className="text-xs text-foreground-muted">{label}</span>
      </div>
    </div>
  );
}
