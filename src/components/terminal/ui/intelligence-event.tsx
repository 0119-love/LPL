import { TrendingUp, ShieldAlert, Shuffle, Sparkles } from "lucide-react";
import type { Tone } from "./tone";

export type IntelligenceEventType = "opportunity" | "risk" | "shift" | "development";

const TYPE_META: Record<IntelligenceEventType, { label: string; tone: Tone; icon: typeof TrendingUp }> = {
  opportunity: { label: "OPPORTUNITY", tone: "buy", icon: TrendingUp },
  risk: { label: "RISK", tone: "nobuy", icon: ShieldAlert },
  shift: { label: "SHIFT", tone: "violet", icon: Shuffle },
  development: { label: "DEVELOPMENT", tone: "cyan", icon: Sparkles },
};

const TONE_VAR: Record<Tone, string> = {
  buy: "var(--term-buy)",
  nobuy: "var(--term-nobuy)",
  neutral: "var(--term-text-mid)",
  amber: "var(--term-amber)",
  cyan: "var(--term-cyan)",
  violet: "var(--term-violet)",
};

export function IntelligenceEvent({
  time,
  type,
  title,
  confidence,
}: {
  time: string;
  type: IntelligenceEventType;
  title: string;
  confidence: number;
}) {
  const meta = TYPE_META[type];
  const Icon = meta.icon;
  const color = TONE_VAR[meta.tone];

  return (
    <div className="flex gap-3 px-4 py-3" style={{ borderLeft: `2px solid ${color}` }}>
      <Icon size={14} strokeWidth={1.75} className="mt-0.5 shrink-0" style={{ color }} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[9.5px] font-bold tracking-wide" style={{ color }}>
            {meta.label}
          </span>
          <span className="term-mono text-[10px] text-[var(--term-text-dim)]">{time}</span>
        </div>
        <p className="mt-0.5 text-[12.5px] leading-snug text-[var(--term-text)]">{title}</p>
      </div>
      <span className="term-mono shrink-0 self-start text-[10.5px] text-[var(--term-text-dim)]">
        {confidence}%
      </span>
    </div>
  );
}
