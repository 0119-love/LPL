import { NextRequest, NextResponse } from "next/server";
import { getFundamentals } from "@/lib/yahoo/client";

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol");
  if (!symbol) {
    return NextResponse.json({ error: "missing_symbol" }, { status: 400 });
  }

  try {
    const data = await getFundamentals(symbol.trim().toUpperCase());
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "fundamentals_failed" }, { status: 502 });
  }
}
