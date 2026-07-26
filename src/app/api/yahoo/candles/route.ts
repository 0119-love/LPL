import { NextRequest, NextResponse } from "next/server";
import { getCandles, type ChartRange } from "@/lib/yahoo/client";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/rate-limit";

const VALID_RANGES: ChartRange[] = ["1D", "1W", "1M", "3M", "1Y"];

export async function GET(request: NextRequest) {
  if (!checkRateLimit(clientKeyFromRequest(request))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const symbol = request.nextUrl.searchParams.get("symbol");
  const range = request.nextUrl.searchParams.get("range") as ChartRange | null;

  if (!symbol) {
    return NextResponse.json({ error: "missing_symbol" }, { status: 400 });
  }
  if (!range || !VALID_RANGES.includes(range)) {
    return NextResponse.json({ error: "invalid_range" }, { status: 400 });
  }

  try {
    const candles = await getCandles(symbol.trim().toUpperCase(), range);
    return NextResponse.json({ candles });
  } catch {
    return NextResponse.json({ error: "candles_failed" }, { status: 502 });
  }
}
