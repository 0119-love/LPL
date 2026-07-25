import { describe, expect, it } from "vitest";
import { aggregateAccuracyByMember, buildTimelineSegments, computeAccuracy } from "./verdict-accuracy";
import type { Asset, VoteHistoryPoint } from "./mock/data";
import type { Candle } from "./yahoo/client";

const DAY_MS = 24 * 60 * 60 * 1000;

function candleAt(daysAgo: number, close: number): Candle {
  return {
    time: Date.now() - daysAgo * DAY_MS,
    open: close,
    high: close,
    low: close,
    close,
    volume: 0,
  };
}

describe("computeAccuracy", () => {
  it("marks a buy call correct when price rose since then", () => {
    const candles = [candleAt(10, 100), candleAt(0, 120)];
    const history: VoteHistoryPoint[] = [{ verdict: "buy", daysAgo: 10 }];

    const result = computeAccuracy(candles, history);

    expect(result).toHaveLength(1);
    expect(result[0].correct).toBe(true);
    expect(result[0].changePct).toBeCloseTo(20, 5);
  });

  it("marks a buy call incorrect when price fell", () => {
    const candles = [candleAt(10, 100), candleAt(0, 80)];
    const history: VoteHistoryPoint[] = [{ verdict: "buy", daysAgo: 10 }];

    const result = computeAccuracy(candles, history);

    expect(result[0].correct).toBe(false);
  });

  it("marks a no_buy call correct when price fell or held flat", () => {
    const candles = [candleAt(10, 100), candleAt(0, 100)];
    const history: VoteHistoryPoint[] = [{ verdict: "no_buy", daysAgo: 10 }];

    const result = computeAccuracy(candles, history);

    expect(result[0].correct).toBe(true);
  });

  it("skips the live/current point (daysAgo 0) — it has no outcome yet", () => {
    const candles = [candleAt(10, 100), candleAt(0, 120)];
    const history: VoteHistoryPoint[] = [
      { verdict: "buy", daysAgo: 10 },
      { verdict: "buy", daysAgo: 0 },
    ];

    const result = computeAccuracy(candles, history);

    expect(result).toHaveLength(1);
    expect(result[0].daysAgo).toBe(10);
  });

  it("returns an empty array when there is no candle data", () => {
    expect(computeAccuracy(undefined, [{ verdict: "buy", daysAgo: 5 }])).toEqual([]);
    expect(computeAccuracy([], [{ verdict: "buy", daysAgo: 5 }])).toEqual([]);
  });
});

describe("buildTimelineSegments", () => {
  it("produces one full-width segment when the verdict never changed", () => {
    const history: VoteHistoryPoint[] = [
      { verdict: "buy", daysAgo: 21 },
      { verdict: "buy", daysAgo: 0 },
    ];

    const segments = buildTimelineSegments(history, 21);

    expect(segments).toEqual([{ fromDaysAgo: 21, toDaysAgo: 0, verdict: "buy" }]);
  });

  it("produces a visible trailing segment for a flip that happened a few days ago", () => {
    // Regression test: a flip recorded only as the implicit daysAgo:0 point
    // used to collapse to a zero-width segment and never render.
    const history: VoteHistoryPoint[] = [
      { verdict: "no_buy", daysAgo: 21 },
      { verdict: "no_buy", daysAgo: 7 },
      { verdict: "buy", daysAgo: 3 },
      { verdict: "buy", daysAgo: 0 },
    ];

    const segments = buildTimelineSegments(history, 21);
    const last = segments[segments.length - 1];

    expect(last.verdict).toBe("buy");
    expect(last.fromDaysAgo - last.toDaysAgo).toBeGreaterThan(0);
  });

  it("splits into a segment per verdict change, oldest first", () => {
    const history: VoteHistoryPoint[] = [
      { verdict: "no_buy", daysAgo: 21 },
      { verdict: "buy", daysAgo: 14 },
      { verdict: "no_buy", daysAgo: 6 },
      { verdict: "no_buy", daysAgo: 0 },
    ];

    const segments = buildTimelineSegments(history, 21);

    expect(segments).toEqual([
      { fromDaysAgo: 21, toDaysAgo: 14, verdict: "no_buy" },
      { fromDaysAgo: 14, toDaysAgo: 6, verdict: "buy" },
      { fromDaysAgo: 6, toDaysAgo: 0, verdict: "no_buy" },
    ]);
  });
});

describe("aggregateAccuracyByMember", () => {
  it("tallies correct/total across all assets for each member", () => {
    const candles: Record<string, Candle[]> = {
      AAA: [candleAt(10, 100), candleAt(0, 120)], // price rose
      BBB: [candleAt(10, 100), candleAt(0, 80)], // price fell
    };

    const assets: Asset[] = [
      {
        id: "1",
        ticker: "AAA",
        name: "Asset A",
        price: 120,
        changePct: 20,
        volumeToday: 0,
        sparkline: [],
        votes: [
          {
            memberId: "m1",
            verdict: "buy",
            rationale: "",
            detail: "",
            relatedMetric: "",
            history: [
              { verdict: "buy", daysAgo: 10 },
              { verdict: "buy", daysAgo: 0 },
            ],
          },
        ],
      },
      {
        id: "2",
        ticker: "BBB",
        name: "Asset B",
        price: 80,
        changePct: -20,
        volumeToday: 0,
        sparkline: [],
        votes: [
          {
            memberId: "m1",
            verdict: "buy",
            rationale: "",
            detail: "",
            relatedMetric: "",
            history: [
              { verdict: "buy", daysAgo: 10 },
              { verdict: "buy", daysAgo: 0 },
            ],
          },
        ],
      },
    ];

    const result = aggregateAccuracyByMember(assets, candles);

    expect(result).toEqual([{ memberId: "m1", correct: 1, total: 2 }]);
  });
});
