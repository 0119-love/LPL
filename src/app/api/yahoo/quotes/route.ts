import { NextRequest, NextResponse } from "next/server";
import { getQuotes } from "@/lib/yahoo/client";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  if (!checkRateLimit(clientKeyFromRequest(request))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const symbolsParam = request.nextUrl.searchParams.get("symbols");
  if (!symbolsParam) {
    return NextResponse.json({ error: "missing_symbols" }, { status: 400 });
  }
  const symbols = symbolsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (symbols.length === 0) {
    return NextResponse.json({ error: "missing_symbols" }, { status: 400 });
  }

  try {
    const quotes = await getQuotes(symbols);
    return NextResponse.json({ quotes });
  } catch {
    return NextResponse.json({ error: "quotes_failed" }, { status: 502 });
  }
}
