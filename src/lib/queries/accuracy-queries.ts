import { useQueries } from "@tanstack/react-query";
import type { Candle } from "@/lib/yahoo/client";

async function fetchCandles3M(ticker: string): Promise<Candle[]> {
  const res = await fetch(`/api/yahoo/candles?symbol=${ticker}&range=3M`);
  if (!res.ok) throw new Error("candles_failed");
  const data = await res.json();
  return data.candles as Candle[];
}

/** One 3M-candle series per ticker, keyed for O(1) lookup, used to score past verdicts. */
export function useCandlesByTicker(tickers: string[]) {
  const results = useQueries({
    queries: tickers.map((ticker) => ({
      queryKey: ["accuracy-candles", ticker],
      queryFn: () => fetchCandles3M(ticker),
      staleTime: 5 * 60_000,
    })),
  });

  const map: Record<string, Candle[] | undefined> = {};
  tickers.forEach((ticker, i) => {
    map[ticker] = results[i].data;
  });

  return { candlesByTicker: map, isPending: results.some((r) => r.isPending) };
}
