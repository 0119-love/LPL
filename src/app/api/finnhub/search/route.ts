import { NextRequest, NextResponse } from "next/server";
import { searchSymbol } from "@/lib/finnhub/client";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q || q.trim().length < 1) {
    return NextResponse.json({ count: 0, result: [] });
  }

  try {
    const data = await searchSymbol(q.trim());
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "search_failed" },
      { status: 502 },
    );
  }
}
