import { TONE_TEXT_CLASS } from "./tone";
import { verdictTone } from "./signal-badge";

export type CommitteeVerdict = "BUY" | "NO_BUY";

export type CommitteeMemberData = {
  id: string;
  initial: string;
  name: string;
  role: string;
  verdict: CommitteeVerdict;
  score: number;
};

const ROW_COLS = "grid-cols-[1fr_64px_96px] sm:grid-cols-[1fr_72px_120px]";
const VERDICT_LABEL: Record<CommitteeVerdict, string> = { BUY: "BUY", NO_BUY: "NO-BUY" };

export function CommitteeMember({
  initial,
  name,
  role,
  verdict,
  score,
}: {
  initial: string;
  name: string;
  role: string;
  verdict: CommitteeVerdict;
  score: number;
}) {
  const tone = verdictTone(verdict);

  return (
    <div className={`grid ${ROW_COLS} items-center gap-2 px-5 py-3`}>
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.06] text-[11px] font-semibold">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="text-[12.5px] font-medium leading-tight truncate">{name}</p>
          <p className="text-[10.5px] text-[var(--term-text-dim)] truncate">{role}</p>
        </div>
      </div>
      <span className={`text-[11.5px] font-semibold ${TONE_TEXT_CLASS[tone]}`}>
        {VERDICT_LABEL[verdict]}
      </span>
      <div className="flex items-center gap-2">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full rounded-full bg-[var(--term-cyan)]" style={{ width: `${score}%` }} />
        </div>
        <span className="term-mono w-6 shrink-0 text-right text-[10.5px] text-[var(--term-text-mid)]">
          {score}
        </span>
      </div>
    </div>
  );
}

export function CommitteeTableHead() {
  return (
    <div
      className={`grid ${ROW_COLS} items-center gap-2 border-b border-[var(--term-border)] px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--term-text-dim)]`}
    >
      <span>Analyst</span>
      <span>Signal</span>
      <span>Score</span>
    </div>
  );
}
