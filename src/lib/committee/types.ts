export type Verdict = "buy" | "no_buy";

export type VoteHistoryPoint = {
  verdict: Verdict;
  daysAgo: number;
};

export type Vote = {
  memberId: string;
  verdict: Verdict;
  rationale: string;
  detail: string;
  relatedMetric: string;
  history: VoteHistoryPoint[];
};

export function consensus(votes: Vote[]): {
  buy: number;
  noBuy: number;
  verdict: "buy" | "no_buy" | "split";
} {
  const buy = votes.filter((v) => v.verdict === "buy").length;
  const noBuy = votes.length - buy;
  const verdict = buy > noBuy ? "buy" : noBuy > buy ? "no_buy" : "split";
  return { buy, noBuy, verdict };
}
