// Pure functions that turn real business-logic data (committee votes,
// portfolio snapshots) into the shapes the terminal UI primitives expect.
// No fetching here — callers pass in already-fetched data.

import type { Vote } from "@/lib/committee/types";
import type { CommitteeVerdictRow } from "@/lib/supabase/committee";
import type { Snapshot } from "@/lib/supabase/portfolio";
import { committeeMembers } from "@/lib/committee/members";
import type { CommitteeMemberData } from "@/components/terminal/ui/committee-member";
import type { IntelligenceEvent } from "@/lib/terminal/mock-data";

// Radar/table role labels, in the same fixed member order used across the
// rest of the app (m1 Kang ... m5 Devon). The committee table shows these
// functional roles instead of personal names.
const ROLE_BY_MEMBER_ID: Record<string, string> = {
  m1: "Chart Analyst",
  m2: "News Analyst",
  m3: "Fundamental Analyst",
  m4: "Market Strategist",
  m5: "Deep Research",
};

const DESCRIPTION_BY_MEMBER_ID: Record<string, string> = {
  m1: "Price action & technical patterns",
  m2: "Breaking news & sentiment shifts",
  m3: "Financial statements & valuation",
  m4: "Macro trends & positioning",
  m5: "Multi-source deep-dive synthesis",
};

const DIMENSION_BY_MEMBER_ID: Record<string, string> = {
  m1: "Chart",
  m2: "News",
  m3: "Finance",
  m4: "Market",
  m5: "Deep Research",
};

/** % of a member's recent history (including the latest vote) that agrees with their current verdict. */
export function convictionScore(vote: Vote): number {
  if (vote.history.length === 0) return 100;
  const matching = vote.history.filter((h) => h.verdict === vote.verdict).length;
  return Math.round((matching / vote.history.length) * 100);
}

/** 0-100 "how bullish" reading for a single member, used for both the score column and the radar axis. */
export function bullishness(vote: Vote): number {
  const conviction = convictionScore(vote);
  return vote.verdict === "buy"
    ? Math.round(60 + conviction * 0.4)
    : Math.round(40 - conviction * 0.3);
}

export function deriveCommitteeSummary(votes: Vote[]) {
  const total = votes.length;
  const buyCount = votes.filter((v) => v.verdict === "buy").length;
  const majorityBuy = buyCount >= total - buyCount;
  const agree = total === 0 ? 0 : majorityBuy ? buyCount : total - buyCount;
  const score =
    total === 0 ? 0 : Math.round(votes.reduce((sum, v) => sum + bullishness(v), 0) / total);

  return {
    verdictLabel: total === 0 ? "PENDING" : majorityBuy ? "BULLISH" : "CAUTIOUS",
    score,
    agree,
    total,
    confidence: total === 0 ? 0 : Math.round((agree / total) * 100),
  };
}

export function deriveRadarDimensions(votes: Vote[]) {
  return votes.map((v) => ({
    dimension: DIMENSION_BY_MEMBER_ID[v.memberId] ?? v.memberId,
    value: bullishness(v),
  }));
}

export function deriveMemberRows(votes: Vote[]): CommitteeMemberData[] {
  return votes.map((v) => {
    const role = ROLE_BY_MEMBER_ID[v.memberId] ?? "Analyst";
    return {
      id: v.memberId,
      initial: role[0],
      role,
      description: DESCRIPTION_BY_MEMBER_ID[v.memberId] ?? "General analysis",
      verdict: v.verdict === "buy" ? "BUY" : "NO_BUY",
      score: bullishness(v),
    };
  });
}

/** Turns real committee rows (rationale/detail written by Gemini) into feed items — no separate feed engine needed. */
export function deriveIntelligenceFromCommittee(
  rows: CommitteeVerdictRow[],
  ticker: string,
): IntelligenceEvent[] {
  if (rows.length === 0) return [];

  const latestByMember = new Map<string, CommitteeVerdictRow>();
  for (const row of rows) {
    if (!latestByMember.has(row.memberId)) latestByMember.set(row.memberId, row);
  }

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const memberEvents: IntelligenceEvent[] = Array.from(latestByMember.entries()).map(
    ([memberId, row]) => {
      const member = committeeMembers.find((m) => m.id === memberId);
      return {
        id: `${memberId}-${row.generatedAt}`,
        time: formatTime(row.generatedAt),
        type: row.verdict === "buy" ? "opportunity" : "risk",
        title: `${member?.name ?? memberId} on ${ticker}: ${row.rationale}`,
        confidence: convictionScore({
          memberId,
          verdict: row.verdict,
          rationale: row.rationale,
          detail: row.detail,
          relatedMetric: row.relatedMetric,
          history: rows
            .filter((r) => r.memberId === memberId)
            .map((r) => ({
              verdict: r.verdict,
              daysAgo: (Date.now() - new Date(r.generatedAt).getTime()) / 86_400_000,
            })),
        }),
      };
    },
  );

  const newest = rows.reduce((max, r) => (r.generatedAt > max.generatedAt ? r : max), rows[0]);
  const refreshEvent: IntelligenceEvent = {
    id: `refresh-${newest.generatedAt}`,
    time: formatTime(newest.generatedAt),
    type: "development",
    title: `Committee analysis refreshed for ${ticker}`,
    confidence: 100,
  };

  return [refreshEvent, ...memberEvents.sort((a, b) => (a.time < b.time ? 1 : -1))].slice(0, 4);
}

export type PortfolioStats = {
  riskScore: number;
  sharpeRatio: number;
  maxDrawdownPct: number;
  hasEnoughHistory: boolean;
};

/** Real return/risk stats from daily snapshots. Needs a handful of data points to mean anything. */
export function computePortfolioStats(snapshots: Snapshot[]): PortfolioStats {
  if (snapshots.length < 4) {
    return { riskScore: 0, sharpeRatio: 0, maxDrawdownPct: 0, hasEnoughHistory: false };
  }

  const values = snapshots.map((s) => s.totalValue);
  const returns: number[] = [];
  for (let i = 1; i < values.length; i++) {
    if (values[i - 1] > 0) returns.push((values[i] - values[i - 1]) / values[i - 1]);
  }

  const mean = returns.reduce((s, r) => s + r, 0) / returns.length;
  const variance = returns.reduce((s, r) => s + (r - mean) ** 2, 0) / returns.length;
  const stdev = Math.sqrt(variance);

  const annualizedVol = stdev * Math.sqrt(252);
  const sharpeRatio = stdev === 0 ? 0 : (mean / stdev) * Math.sqrt(252);
  const riskScore = Math.round(Math.min(100, annualizedVol * 100));

  let peak = values[0];
  let maxDrawdown = 0;
  for (const v of values) {
    peak = Math.max(peak, v);
    maxDrawdown = Math.min(maxDrawdown, (v - peak) / peak);
  }

  return {
    riskScore,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    maxDrawdownPct: Math.round(maxDrawdown * 10000) / 100,
    hasEnoughHistory: true,
  };
}
