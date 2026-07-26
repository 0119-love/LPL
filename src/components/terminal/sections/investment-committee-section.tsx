"use client";

import { VerdictPanel } from "../ui/verdict-panel";
import { StatusIndicator } from "../ui/status-indicator";
import { useSpotlightCommittee } from "@/lib/queries/terminal-queries";
import {
  deriveCommitteeSummary,
  deriveMemberRows,
  deriveRadarDimensions,
} from "@/lib/terminal/derive";
import { committeeMembers } from "@/lib/committee/members";
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
  initial: committeeMembers.find((m) => m.id === a.id)?.initial ?? a.name[0],
  name: a.name,
  role: a.role,
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
    />
  );
}
