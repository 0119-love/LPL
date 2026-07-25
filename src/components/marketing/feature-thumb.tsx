import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";

const GRADIENTS = [
  "radial-gradient(120% 120% at 0% 0%, rgba(61,220,132,0.28), transparent 60%), linear-gradient(160deg, #14231c, #0a0a0b)",
  "radial-gradient(120% 120% at 100% 0%, rgba(255,138,76,0.24), transparent 60%), linear-gradient(160deg, #241a12, #0a0a0b)",
  "radial-gradient(120% 120% at 0% 100%, rgba(120,140,255,0.22), transparent 60%), linear-gradient(160deg, #161826, #0a0a0b)",
];

// Reference frame: 355 x 142 — wide feature-intro thumbnail, exact ratio preserved.
export function FeatureThumb({
  index,
  icon: Icon,
  title,
  desc,
}: {
  index: number;
  icon: LucideIcon;
  title: string;
  desc: string;
}) {
  return (
    <div
      className={clsx(
        "aspect-[355/142] w-full rounded-2xl border border-border-subtle p-4 md:p-5 flex flex-col justify-end",
      )}
      style={{ background: GRADIENTS[index % GRADIENTS.length] }}
    >
      <div className="glass-card rounded-xl p-3.5 max-w-[85%]">
        <Icon size={18} strokeWidth={1.75} className="mb-1.5 text-foreground" />
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-xs text-foreground-muted leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}
