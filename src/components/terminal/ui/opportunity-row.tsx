import { Sparkline } from "./sparkline";
import { toneForChange, TONE_TEXT_CLASS } from "./tone";

export function OpportunityRow({
  rank,
  ticker,
  name,
  tags,
  score,
  changePct,
  spark,
}: {
  rank: number;
  ticker: string;
  name: string;
  tags: string[];
  score: number;
  changePct: number;
  spark: number[];
}) {
  const tone = toneForChange(changePct);
  const positive = changePct >= 0;

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="term-mono w-4 shrink-0 text-[11px] text-[var(--term-text-dim)]">{rank}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] font-semibold">{ticker}</span>
          <span className="truncate text-[10.5px] text-[var(--term-text-dim)]">{name}</span>
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-[var(--term-border)] px-1.5 py-0.5 text-[9.5px] text-[var(--term-text-mid)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <Sparkline data={spark} positive={positive} width={48} height={22} />
      <div className="w-14 shrink-0 text-right">
        <p className={`term-mono text-[12px] font-semibold ${TONE_TEXT_CLASS[tone]}`}>
          {positive ? "+" : ""}
          {changePct.toFixed(2)}%
        </p>
        <p className="term-mono text-[10px] text-[var(--term-text-dim)]">score {score}</p>
      </div>
    </div>
  );
}
