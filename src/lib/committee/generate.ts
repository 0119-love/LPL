import type { SupabaseClient } from "@supabase/supabase-js";
import { getQuote } from "@/lib/finnhub/client";
import { getFundamentals } from "@/lib/yahoo/client";
import { generateStructuredJSON, type GeminiSchema } from "@/lib/gemini/client";
import { getOrCreateAssetId } from "@/lib/supabase/get-or-create-asset";
import { committeeMembers } from "./members";

export type GeneratedVerdict = {
  memberId: string;
  verdict: "buy" | "no_buy";
  rationale: string;
  detail: string;
  relatedMetric: string;
};

const schema: GeminiSchema = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      memberId: { type: "STRING", enum: committeeMembers.map((p) => p.id) },
      verdict: { type: "STRING", enum: ["buy", "no_buy"] },
      rationale: { type: "STRING" },
      detail: { type: "STRING" },
      relatedMetric: { type: "STRING" },
    },
    required: ["memberId", "verdict", "rationale", "detail", "relatedMetric"],
  },
};

const fmt = (v: number | null | undefined, suffix = "") =>
  v == null ? "N/A" : `${v}${suffix}`;

function buildPrompt(
  ticker: string,
  name: string,
  quote: Awaited<ReturnType<typeof getQuote>>,
  fundamentals: Awaited<ReturnType<typeof getFundamentals>> | null,
) {
  return `당신은 5명의 투자 위원회 위원입니다. 아래 종목 데이터를 보고 각자의 투자 철학에 따라 독립적으로 매수(buy) 또는 비매수(no_buy) 판정을 내리세요.

종목: ${ticker} (${name})
현재가: $${quote.c.toFixed(2)} (당일 ${quote.dp >= 0 ? "+" : ""}${quote.dp.toFixed(2)}%)
PER(TTM): ${fmt(fundamentals?.trailingPE)} / PER(예상): ${fmt(fundamentals?.forwardPE)}
매출총이익률: ${fmt(fundamentals ? Math.round((fundamentals.grossMargins ?? 0) * 1000) / 10 : null, "%")}
EBITDA 마진: ${fmt(fundamentals ? Math.round((fundamentals.ebitdaMargins ?? 0) * 1000) / 10 : null, "%")}
매출액: ${fmt(fundamentals?.totalRevenue)} / 부채비율: ${fmt(fundamentals?.debtToEquity)} / 유동비율: ${fmt(fundamentals?.currentRatio)}
52주 범위: $${fmt(fundamentals?.fiftyTwoWeekLow)} - $${fmt(fundamentals?.fiftyTwoWeekHigh)}
애널리스트 컨센서스: ${fundamentals?.recommendationKey ?? "N/A"} (${fmt(fundamentals?.numberOfAnalystOpinions)}명, 목표가 $${fmt(fundamentals?.targetMeanPrice)})

위원 목록:
${committeeMembers.map((p) => `- ${p.id} (${p.name}): ${p.style}`).join("\n")}

각 위원마다 verdict(buy/no_buy), rationale(1문장, 40자 내외), detail(2~3문장 근거), relatedMetric(위 데이터 중 핵심 근거 1개, 예: "PER(TTM) 40.3배")를 한국어로 작성하세요. 위원마다 서로 다른 관점을 반영해 의견이 갈릴 수 있습니다. 데이터가 N/A인 항목은 근거로 사용하지 마세요.`;
}

export async function generateCommitteeVerdicts(
  supabase: SupabaseClient,
  ticker: string,
  name: string,
): Promise<GeneratedVerdict[]> {
  const [quote, fundamentals] = await Promise.all([
    getQuote(ticker),
    getFundamentals(ticker).catch(() => null),
  ]);

  const prompt = buildPrompt(ticker, name, quote, fundamentals);
  const results = await generateStructuredJSON<GeneratedVerdict[]>(prompt, schema);

  const assetId = await getOrCreateAssetId(supabase, ticker, name);

  const { error } = await supabase.from("committee_verdicts").insert(
    results.map((r) => ({
      member_id: r.memberId,
      asset_id: assetId,
      verdict: r.verdict,
      rationale: r.rationale,
      detail: r.detail,
      related_metric: r.relatedMetric,
    })),
  );
  if (error) throw error;

  return results;
}
