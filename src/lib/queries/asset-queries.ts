import { useQuery } from "@tanstack/react-query";
import type { Candle, ChartRange } from "@/lib/yahoo/client";

async function fetchCandles(ticker: string, range: ChartRange): Promise<Candle[]> {
  const res = await fetch(`/api/yahoo/candles?symbol=${ticker}&range=${range}`);
  if (!res.ok) throw new Error("candles_failed");
  const data = await res.json();
  return data.candles;
}

export function useCandles(ticker: string, range: ChartRange) {
  return useQuery({
    queryKey: ["candles", ticker, range],
    queryFn: () => fetchCandles(ticker, range),
    staleTime: 60_000,
  });
}

export type Fundamentals = {
  currentPrice: number | null;
  targetMeanPrice: number | null;
  recommendationKey: string | null;
  numberOfAnalystOpinions: number | null;
  totalRevenue: number | null;
  revenuePerShare: number | null;
  grossMargins: number | null;
  ebitdaMargins: number | null;
  debtToEquity: number | null;
  currentRatio: number | null;
  trailingPE: number | null;
  forwardPE: number | null;
  dividendYield: number | null;
  marketCap: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  trailingEps: number | null;
  beta: number | null;
};

async function fetchFundamentals(ticker: string): Promise<Fundamentals> {
  const res = await fetch(`/api/yahoo/fundamentals?symbol=${ticker}`);
  if (!res.ok) throw new Error("fundamentals_failed");
  return res.json();
}

export function useFundamentals(ticker: string) {
  return useQuery({
    queryKey: ["fundamentals", ticker],
    queryFn: () => fetchFundamentals(ticker),
    staleTime: 5 * 60_000,
  });
}
