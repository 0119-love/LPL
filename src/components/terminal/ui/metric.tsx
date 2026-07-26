import type { ReactNode } from "react";
import { TONE_TEXT_CLASS, type Tone } from "./tone";

const SIZE_CLASS: Record<"sm" | "md" | "lg" | "xl", string> = {
  sm: "text-[13px]",
  md: "text-[15px]",
  lg: "text-xl",
  xl: "text-3xl",
};

export function Metric({
  label,
  value,
  unit,
  sublabel,
  tone = "neutral",
  size = "md",
  visual,
  align = "left",
  className = "",
}: {
  label: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
  sublabel?: ReactNode;
  tone?: Tone;
  size?: "sm" | "md" | "lg" | "xl";
  visual?: ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${align === "right" ? "text-right flex-row-reverse" : ""} ${className}`}>
      {visual}
      <div>
        <p className="term-eyebrow">{label}</p>
        <p className={`term-mono mt-1 font-semibold leading-tight ${SIZE_CLASS[size]} ${tone !== "neutral" ? TONE_TEXT_CLASS[tone] : ""}`}>
          {value}
          {unit != null && <span className="text-[var(--term-text-dim)]">{unit}</span>}
        </p>
        {sublabel != null && (
          <p className="text-[10.5px] text-[var(--term-text-dim)] mt-0.5">{sublabel}</p>
        )}
      </div>
    </div>
  );
}
