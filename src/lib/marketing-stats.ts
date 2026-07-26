import { unstable_cache } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { fetchCommitteeVerdicts } from "@/lib/supabase/committee";
import { getCandles } from "@/lib/yahoo/client";
import { committeeMembers } from "@/lib/committee/members";
import { aggregateAccuracyByMember } from "@/lib/verdict-accuracy";
import { toVotes } from "@/lib/queries/committee-queries";

// Same fixed sample as the signed-out dashboard preview — keeps the accuracy
// stat bounded to a few external candle fetches instead of scanning every asset.
const ACCURACY_SAMPLE_TICKERS = ["AAPL", "NVDA", "TSLA"];

export type MemberAccuracy = { memberId: string; correct: number; total: number };

export type MarketingStats = {
  memberCount: number;
  assetsRuledOn: number;
  accuracyPct: number | null;
  memberAccuracy: MemberAccuracy[];
};

async function computeMarketingStats(): Promise<MarketingStats> {
  // Plain anon client (no cookies/session) — unstable_cache can't touch request-scoped
  // data sources, and these tables are public-read anyway (no auth needed).
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data: verdictRows } = await supabase.from("committee_verdicts").select("asset_id");
  const assetsRuledOn = new Set((verdictRows ?? []).map((r) => r.asset_id as string)).size;

  const memberTally = new Map<string, MemberAccuracy>();

  for (const ticker of ACCURACY_SAMPLE_TICKERS) {
    try {
      const rows = await fetchCommitteeVerdicts(ticker, supabase);
      if (rows.length === 0) continue;
      const votes = toVotes(rows);
      const candles = await getCandles(ticker, "3M");
      const tally = aggregateAccuracyByMember([{ ticker, votes }], { [ticker]: candles });
      for (const m of tally) {
        const entry = memberTally.get(m.memberId) ?? { memberId: m.memberId, correct: 0, total: 0 };
        entry.correct += m.correct;
        entry.total += m.total;
        memberTally.set(m.memberId, entry);
      }
    } catch {
      // A single ticker's external fetch failing shouldn't sink the whole stat.
    }
  }

  const memberAccuracy = Array.from(memberTally.values());
  const correct = memberAccuracy.reduce((sum, m) => sum + m.correct, 0);
  const total = memberAccuracy.reduce((sum, m) => sum + m.total, 0);

  return {
    memberCount: committeeMembers.length,
    assetsRuledOn,
    accuracyPct: total > 0 ? Math.round((correct / total) * 100) : null,
    memberAccuracy,
  };
}

// Bounds how often the Yahoo/Supabase calls above run for the (public,
// high-traffic-relative-to-the-rest-of-the-app) marketing page.
export const getMarketingStats = unstable_cache(computeMarketingStats, ["marketing-stats"], {
  revalidate: 3600,
});
