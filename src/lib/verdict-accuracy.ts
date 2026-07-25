import type { Candle } from "@/lib/yahoo/client";
import type { Asset, Verdict, VoteHistoryPoint } from "@/lib/mock/data";

export type AccuracyPoint = {
  daysAgo: number;
  verdict: Verdict;
  correct: boolean;
  changePct: number;
};

function closestClose(candles: Candle[], targetTime: number): number | null {
  if (!candles.length) return null;
  let best = candles[0];
  let bestDiff = Math.abs(candles[0].time - targetTime);
  for (const c of candles) {
    const diff = Math.abs(c.time - targetTime);
    if (diff < bestDiff) {
      best = c;
      bestDiff = diff;
    }
  }
  return best.close;
}

/** Compares each past verdict (daysAgo > 0) against real price movement since then. */
export function computeAccuracy(
  candles: Candle[] | undefined,
  history: VoteHistoryPoint[],
): AccuracyPoint[] {
  if (!candles || candles.length === 0) return [];
  const nowClose = candles[candles.length - 1].close;

  return history
    .filter((h) => h.daysAgo > 0)
    .map((h) => {
      const targetTime = Date.now() - h.daysAgo * 24 * 60 * 60 * 1000;
      const priceThen = closestClose(candles, targetTime);
      if (priceThen == null) return null;
      const changePct = ((nowClose - priceThen) / priceThen) * 100;
      const correct = h.verdict === "buy" ? changePct > 0 : changePct <= 0;
      return { daysAgo: h.daysAgo, verdict: h.verdict, correct, changePct };
    })
    .filter((v): v is AccuracyPoint => v !== null);
}

export type MemberAccuracy = { memberId: string; correct: number; total: number };

/** Aggregates every member's track record across all assets into a win/total tally. */
export function aggregateAccuracyByMember(
  assets: Asset[],
  candlesByTicker: Record<string, Candle[] | undefined>,
): MemberAccuracy[] {
  const tally = new Map<string, { correct: number; total: number }>();

  for (const asset of assets) {
    const candles = candlesByTicker[asset.ticker];
    for (const v of asset.votes) {
      const points = computeAccuracy(candles, v.history);
      const entry = tally.get(v.memberId) ?? { correct: 0, total: 0 };
      entry.correct += points.filter((p) => p.correct).length;
      entry.total += points.length;
      tally.set(v.memberId, entry);
    }
  }

  return Array.from(tally.entries()).map(([memberId, { correct, total }]) => ({
    memberId,
    correct,
    total,
  }));
}

export type TimelineSegment = {
  fromDaysAgo: number;
  toDaysAgo: number;
  verdict: Verdict;
};

/** Collapses a member's history into contiguous held-verdict segments for a swimlane render. */
export function buildTimelineSegments(
  history: VoteHistoryPoint[],
  maxDaysAgo: number,
): TimelineSegment[] {
  const sorted = [...history].sort((a, b) => b.daysAgo - a.daysAgo);
  const segments: TimelineSegment[] = [];

  if (sorted[0] && sorted[0].daysAgo < maxDaysAgo) {
    segments.push({ fromDaysAgo: maxDaysAgo, toDaysAgo: sorted[0].daysAgo, verdict: sorted[0].verdict });
  }

  for (let i = 0; i < sorted.length; i++) {
    const from = sorted[i].daysAgo;
    const to = sorted[i + 1] ? sorted[i + 1].daysAgo : 0;
    if (from === to) continue;
    segments.push({ fromDaysAgo: from, toDaysAgo: to, verdict: sorted[i].verdict });
  }

  return segments;
}
