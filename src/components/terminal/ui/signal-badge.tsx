import { TONE_TEXT_CLASS, type Tone } from "./tone";

const TONE_BADGE_CLASS: Record<Tone, string> = {
  buy: "text-[var(--term-buy)] bg-[var(--term-buy)]/10 border-[var(--term-buy)]/30",
  nobuy: "text-[var(--term-nobuy)] bg-[var(--term-nobuy)]/10 border-[var(--term-nobuy)]/30",
  amber: "text-[var(--term-amber)] bg-[var(--term-amber)]/10 border-[var(--term-amber)]/30",
  cyan: "text-[var(--term-cyan)] bg-[var(--term-cyan)]/10 border-[var(--term-cyan)]/30",
  violet: "text-[var(--term-violet)] bg-[var(--term-violet)]/10 border-[var(--term-violet)]/30",
  neutral: `${TONE_TEXT_CLASS.neutral} bg-white/[0.05] border-[var(--term-border-strong)]`,
};

export function SignalBadge({
  label,
  tone,
  size = "sm",
  className = "",
}: {
  label: string;
  tone: Tone;
  size?: "xs" | "sm";
  className?: string;
}) {
  const sizeClass = size === "xs" ? "px-1.5 py-0.5 text-[9.5px]" : "px-2 py-0.5 text-[10.5px]";

  return (
    <span
      className={`inline-flex shrink-0 rounded border font-bold tracking-wide ${sizeClass} ${TONE_BADGE_CLASS[tone]} ${className}`}
    >
      {label}
    </span>
  );
}

// Matches the real committee's two-state verdict (lib/committee/types.ts
// `Verdict`) — there's no third "hold"/"sell" state in the actual data.
export function verdictTone(verdict: "BUY" | "NO_BUY"): Tone {
  return verdict === "BUY" ? "buy" : "nobuy";
}
