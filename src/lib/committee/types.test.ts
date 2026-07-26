import { describe, expect, it } from "vitest";
import { consensus, type Vote } from "./types";

function vote(memberId: string, verdict: "buy" | "no_buy"): Vote {
  return {
    memberId,
    verdict,
    rationale: "",
    detail: "",
    relatedMetric: "",
    history: [{ verdict, daysAgo: 0 }],
  };
}

describe("consensus", () => {
  it("calls buy when the majority voted buy", () => {
    const votes = [vote("m1", "buy"), vote("m2", "buy"), vote("m3", "no_buy")];
    expect(consensus(votes)).toEqual({ buy: 2, noBuy: 1, verdict: "buy" });
  });

  it("calls no_buy when the majority voted no_buy", () => {
    const votes = [vote("m1", "no_buy"), vote("m2", "no_buy"), vote("m3", "buy")];
    expect(consensus(votes)).toEqual({ buy: 1, noBuy: 2, verdict: "no_buy" });
  });

  it("calls split on an even tie", () => {
    const votes = [vote("m1", "buy"), vote("m2", "no_buy")];
    expect(consensus(votes)).toEqual({ buy: 1, noBuy: 1, verdict: "split" });
  });
});
