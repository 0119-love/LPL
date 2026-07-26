// Shared tone vocabulary for the terminal design system — every primitive
// that carries semantic color (Metric, StatusIndicator, SignalBadge, rows)
// maps through the same tone names so callers never hardcode CSS vars.
export type Tone = "buy" | "nobuy" | "neutral" | "amber" | "cyan" | "violet";

export const TONE_COLOR: Record<Tone, string> = {
  buy: "var(--term-buy)",
  nobuy: "var(--term-nobuy)",
  neutral: "var(--term-text-mid)",
  amber: "var(--term-amber)",
  cyan: "var(--term-cyan)",
  violet: "var(--term-violet)",
};

export const TONE_TEXT_CLASS: Record<Tone, string> = {
  buy: "text-[var(--term-buy)]",
  nobuy: "text-[var(--term-nobuy)]",
  neutral: "text-[var(--term-text-mid)]",
  amber: "text-[var(--term-amber)]",
  cyan: "text-[var(--term-cyan)]",
  violet: "text-[var(--term-violet)]",
};

export function toneForChange(value: number): Tone {
  return value >= 0 ? "buy" : "nobuy";
}
