import type { ReactNode } from "react";
import { TONE_COLOR, TONE_TEXT_CLASS, type Tone } from "./tone";

export function StatusIndicator({
  label,
  tone = "buy",
  pulse = false,
  pill = false,
  size = "sm",
  className = "",
}: {
  label: ReactNode;
  tone?: Tone;
  pulse?: boolean;
  pill?: boolean;
  size?: "xs" | "sm";
  className?: string;
}) {
  const dotSize = size === "xs" ? "h-1.5 w-1.5" : "h-2 w-2";
  const textSize = size === "xs" ? "text-[10px]" : "text-[10.5px]";

  const dot = (
    <span
      className={`rounded-full ${dotSize} ${pulse ? "animate-pulse" : ""}`}
      style={{
        background: TONE_COLOR[tone],
        boxShadow: pulse ? `0 0 6px ${TONE_COLOR[tone]}` : undefined,
      }}
    />
  );

  const row = (
    <span
      className={`inline-flex items-center gap-1.5 font-medium ${textSize} ${TONE_TEXT_CLASS[tone]} ${
        pill ? "rounded-full border border-[var(--term-border)] bg-white/[0.03] px-2.5 py-1" : ""
      }`}
    >
      {dot}
      {label}
    </span>
  );

  // `className` (often a responsive `hidden sm:flex` visibility toggle) is
  // applied on this outer wrapper only, which carries no display utility of
  // its own — so it never has to fight the `row` span's hardcoded
  // `inline-flex` for the `display` property in Tailwind's cascade.
  return className ? <span className={className}>{row}</span> : row;
}
