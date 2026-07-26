export function CommitteeConsensus({
  verdictLabel,
  score,
  scoreMax = 100,
  agree,
  total,
  confidence,
}: {
  verdictLabel: string;
  score: number;
  scoreMax?: number;
  agree: number;
  total: number;
  confidence: number;
}) {
  const agreePct = (agree / total) * 100;

  return (
    <div className="p-5">
      <p className="term-eyebrow">Committee Verdict</p>
      <div className="mt-2 flex items-baseline gap-3">
        <span className="text-3xl font-bold tracking-tight text-[var(--term-buy)]">{verdictLabel}</span>
        <span className="term-mono text-xl font-semibold text-[var(--term-text)]">
          {score}
          <span className="text-[var(--term-text-dim)]">/{scoreMax}</span>
        </span>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full rounded-full bg-[var(--term-buy)]" style={{ width: `${agreePct}%` }} />
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px]">
        <span className="text-[var(--term-text-mid)]">
          {agree}/{total} <span className="text-[var(--term-text-dim)]">AGREE</span>
        </span>
        <span className="text-[var(--term-text-dim)]">
          CONFIDENCE <span className="font-medium text-[var(--term-text)]">{confidence}%</span>
        </span>
      </div>
    </div>
  );
}
