import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCommitteeVerdicts } from "@/lib/supabase/committee";
import type { Vote, VoteHistoryPoint } from "@/lib/committee/types";
import type { GeneratedVerdict } from "@/lib/committee/generate";

export function committeeKey(ticker: string) {
  return ["committee-verdicts", ticker] as const;
}

export function useCommitteeVerdicts(ticker: string) {
  return useQuery({
    queryKey: committeeKey(ticker),
    queryFn: () => fetchCommitteeVerdicts(ticker),
    enabled: !!ticker,
  });
}

export function useCommitteeVerdictsForTickers(tickers: string[]) {
  const results = useQueries({
    queries: tickers.map((ticker) => ({
      queryKey: committeeKey(ticker),
      queryFn: () => fetchCommitteeVerdicts(ticker),
    })),
  });

  const rowsByTicker: Record<string, Awaited<ReturnType<typeof fetchCommitteeVerdicts>> | undefined> = {};
  const pendingByTicker: Record<string, boolean> = {};
  tickers.forEach((ticker, i) => {
    rowsByTicker[ticker] = results[i].data;
    pendingByTicker[ticker] = results[i].isPending;
  });

  return { rowsByTicker, pendingByTicker, isPending: results.some((r) => r.isPending) };
}

/** Groups raw rows (newest first) into one Vote per member, with the rest as history. */
export function toVotes(rows: Awaited<ReturnType<typeof fetchCommitteeVerdicts>>): Vote[] {
  const byMember = new Map<string, typeof rows>();
  for (const row of rows) {
    const list = byMember.get(row.memberId) ?? [];
    list.push(row);
    byMember.set(row.memberId, list);
  }

  const votes: Vote[] = [];
  for (const [memberId, memberRows] of byMember) {
    const latest = memberRows[0];
    const history: VoteHistoryPoint[] = memberRows.map((r) => ({
      verdict: r.verdict,
      daysAgo: Math.max(0, (Date.now() - new Date(r.generatedAt).getTime()) / (24 * 60 * 60 * 1000)),
    }));
    votes.push({
      memberId,
      verdict: latest.verdict,
      rationale: latest.rationale,
      detail: latest.detail,
      relatedMetric: latest.relatedMetric,
      history,
    });
  }
  return votes;
}

async function triggerGeneration(input: { ticker: string; name: string }) {
  const res = await fetch("/api/committee/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("generation_failed");
  return (await res.json()) as { results?: GeneratedVerdict[]; skipped?: boolean };
}

export function useTriggerCommitteeGeneration(ticker: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: triggerGeneration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: committeeKey(ticker) });
    },
  });
}
