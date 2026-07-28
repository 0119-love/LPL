"use client";

import { ArrowRight } from "lucide-react";
import { VerdictPanel } from "../ui/verdict-panel";
import { StatusIndicator } from "../ui/status-indicator";
import { Link } from "@/i18n/navigation";
import { useSpotlightCommittee } from "@/lib/queries/terminal-queries";
import {
  deriveCommitteeSummary,
  deriveMemberRows,
  deriveRadarDimensions,
} from "@/lib/terminal/derive";
import {
  committeeAnalysts as fallbackAnalysts,
  committeeVerdict as fallbackVerdict,
  radarDimensions as fallbackRadar,
} from "@/lib/terminal/mock-data";

const SPOTLIGHT_TICKER = "NVDA";
const SPOTLIGHT_NAME = "NVIDIA Corporation";

const fallbackConsensus = {
  verdictLabel: fallbackVerdict.label,
  score: fallbackVerdict.score,
  agree: fallbackVerdict.agree,
  total: fallbackVerdict.total,
  confidence: fallbackVerdict.confidence,
};

const fallbackMembers = fallbackAnalysts.map((a) => ({
  id: a.id,
  initial: a.role[0],
  role: a.role,
  description: a.description,
  verdict: a.verdict,
  score: a.score,
}));

export function InvestmentCommitteeSection() {
  const { votes, isLive, isPending, isGenerating, generationFailed, isLoggedIn } =
    useSpotlightCommittee(SPOTLIGHT_TICKER, SPOTLIGHT_NAME);

  const consensus = isLive ? deriveCommitteeSummary(votes) : fallbackConsensus;
  const dimensions = isLive ? deriveRadarDimensions(votes) : fallbackRadar;
  const members = isLive ? deriveMemberRows(votes) : fallbackMembers;

  let statusLabel = "Sample analysis";
  let statusTone: "buy" | "amber" | "neutral" = "neutral";
  if (isPending) {
    statusLabel = "Loading";
    statusTone = "neutral";
  } else if (isLive) {
    statusLabel = "Live Analysis";
    statusTone = "buy";
  } else if (isGenerating) {
    statusLabel = "Generating live analysis…";
    statusTone = "amber";
  } else if (generationFailed) {
    statusLabel = "Generation failed — showing sample";
    statusTone = "amber";
  } else if (!isLoggedIn) {
    statusLabel = "Sample — log in for live verdicts";
  }

  return (
    <VerdictPanel
      eyebrow="Investment Committee"
      meta={<StatusIndicator label={statusLabel} tone={statusTone} pulse={isLive} size="xs" />}
      consensus={consensus}
      disagreement={{ dimensions, title: `Signal Spread · ${SPOTLIGHT_TICKER}` }}
      members={members}
      footer={
        <div className="border-t border-[var(--term-border)] px-5 py-3">
          <Link
            href={`/asset/${SPOTLIGHT_TICKER}`}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--term-buy)] hover:opacity-80"
          >
            View full committee
            <ArrowRight size={13} strokeWidth={2} />
          </Link>
        </div>
      }
    />
  );
}
