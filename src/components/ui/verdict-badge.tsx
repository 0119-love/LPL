import { clsx } from "clsx";
import type { Verdict } from "@/lib/committee/types";

export function VerdictBadge({
  verdict,
  label,
}: {
  verdict: Verdict | "split";
  label: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        verdict === "buy" && "bg-buy-soft text-buy",
        verdict === "no_buy" && "bg-nobuy-soft text-nobuy",
        verdict === "split" && "bg-white/10 text-foreground-muted",
      )}
    >
      <span
        className={clsx(
          "h-1.5 w-1.5 rounded-full",
          verdict === "buy" && "bg-buy shadow-[0_0_6px_var(--accent-buy)]",
          verdict === "no_buy" && "bg-nobuy shadow-[0_0_6px_var(--accent-nobuy)]",
          verdict === "split" && "bg-foreground-muted",
        )}
      />
      {label}
    </span>
  );
}
