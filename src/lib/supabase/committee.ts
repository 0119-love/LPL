import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "./client";

export type CommitteeVerdictRow = {
  memberId: string;
  verdict: "buy" | "no_buy";
  rationale: string;
  detail: string;
  relatedMetric: string;
  generatedAt: string;
};

export async function fetchCommitteeVerdicts(
  ticker: string,
  client?: SupabaseClient,
): Promise<CommitteeVerdictRow[]> {
  const supabase = client ?? createClient();
  const { data, error } = await supabase
    .from("committee_verdicts")
    .select("member_id, verdict, rationale, detail, related_metric, generated_at, assets!inner(ticker)")
    .eq("assets.ticker", ticker)
    .order("generated_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    memberId: row.member_id as string,
    verdict: row.verdict as "buy" | "no_buy",
    rationale: row.rationale as string,
    detail: row.detail as string,
    relatedMetric: row.related_metric as string,
    generatedAt: row.generated_at as string,
  }));
}
