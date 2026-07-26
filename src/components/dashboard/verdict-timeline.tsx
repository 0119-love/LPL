import { clsx } from "clsx";
import { committeeMembers } from "@/lib/committee/members";
import type { Vote } from "@/lib/committee/types";
import { buildTimelineSegments } from "@/lib/verdict-accuracy";

const MIN_WINDOW_DAYS = 21;

export function VerdictTimeline({ votes }: { votes: Vote[] }) {
  const oldest = Math.max(
    MIN_WINDOW_DAYS,
    ...votes.flatMap((v) => v.history.map((h) => h.daysAgo)),
  );

  return (
    <div className="flex flex-col gap-1.5">
      {votes.map((v) => {
        const member = committeeMembers.find((m) => m.id === v.memberId);
        const segments = buildTimelineSegments(v.history, oldest);

        return (
          <div key={v.memberId} className="flex items-center gap-2">
            <span className="w-5 shrink-0 text-[10px] text-foreground-muted">
              {member?.initial}
            </span>
            <div className="relative flex h-2 flex-1 overflow-hidden rounded-full bg-white/5">
              {segments.map((seg, i) => (
                <div
                  key={i}
                  className={clsx(
                    "h-full",
                    seg.verdict === "buy" ? "bg-buy" : "bg-nobuy",
                  )}
                  style={{
                    width: `${((seg.fromDaysAgo - seg.toDaysAgo) / oldest) * 100}%`,
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}
      <div className="ml-7 flex justify-between text-[10px] text-foreground-muted">
        <span>{Math.round(oldest)}d</span>
        <span>today</span>
      </div>
    </div>
  );
}
