import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCommitteeVerdicts } from "@/lib/committee/generate";
import { checkRateLimit, clientKeyFromHeaders } from "@/lib/rate-limit";

const FRESH_WINDOW_MS = 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  if (!checkRateLimit(clientKeyFromHeaders(request.headers))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const ticker = body?.ticker?.trim().toUpperCase();
  const name = body?.name?.trim();
  if (!ticker || !name) {
    return NextResponse.json({ error: "missing_ticker" }, { status: 400 });
  }

  const { data: asset } = await supabase
    .from("assets")
    .select("id")
    .eq("ticker", ticker)
    .maybeSingle();

  if (asset) {
    const { data: recent } = await supabase
      .from("committee_verdicts")
      .select("generated_at")
      .eq("asset_id", asset.id)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recent && Date.now() - new Date(recent.generated_at).getTime() < FRESH_WINDOW_MS) {
      return NextResponse.json({ skipped: true, reason: "fresh" });
    }
  }

  try {
    const results = await generateCommitteeVerdicts(supabase, ticker, name);
    return NextResponse.json({ results });
  } catch (err) {
    console.error("committee generation failed:", err);
    return NextResponse.json({ error: "generation_failed" }, { status: 502 });
  }
}
