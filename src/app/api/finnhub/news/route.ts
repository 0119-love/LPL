import { NextRequest, NextResponse } from "next/server";
import { getCompanyNews } from "@/lib/finnhub/client";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  if (!checkRateLimit(clientKeyFromRequest(request))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const symbol = request.nextUrl.searchParams.get("symbol");
  if (!symbol) {
    return NextResponse.json({ error: "missing_symbol" }, { status: 400 });
  }

  try {
    const news = await getCompanyNews(symbol.trim().toUpperCase());
    return NextResponse.json({ news });
  } catch {
    return NextResponse.json({ error: "news_failed" }, { status: 502 });
  }
}
