"use client";

import { Panel } from "../ui/panel";
import { IntelligenceEvent } from "../ui/intelligence-event";
import { useCommitteeVerdicts } from "@/lib/queries/committee-queries";
import { deriveIntelligenceFromCommittee } from "@/lib/terminal/derive";
import { intelligenceFeed as fallbackFeed } from "@/lib/terminal/mock-data";

// Reads the same cached committee data InvestmentCommitteeSection fetches
// (and, when logged in, triggers generation for) — no separate feed engine,
// just the real analyst rationale reshaped as feed items.
const SPOTLIGHT_TICKER = "NVDA";

export function IntelligenceFeedSection() {
  const { data: rows, isPending } = useCommitteeVerdicts(SPOTLIGHT_TICKER);
  const liveEvents = rows ? deriveIntelligenceFromCommittee(rows, SPOTLIGHT_TICKER) : [];
  const events = liveEvents.length > 0 ? liveEvents : fallbackFeed;

  return (
    <Panel
      eyebrow="Intelligence Feed"
      meta={
        isPending ? (
          <span className="text-[var(--term-text-dim)]">Loading…</span>
        ) : (
          <a href="#" className="text-[var(--term-text-dim)] hover:text-[var(--term-text)]">
            View all
          </a>
        )
      }
      noPadding
    >
      <div className="divide-y divide-[var(--term-border)]">
        {events.map((event) => (
          <IntelligenceEvent key={event.id} {...event} />
        ))}
      </div>
    </Panel>
  );
}
