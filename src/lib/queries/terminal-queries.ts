import { useEffect, useRef } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import type { YahooQuote, Candle, ChartRange } from "@/lib/yahoo/client";
import type { FinnhubNewsItem } from "@/lib/finnhub/client";
import { useUser } from "@/lib/supabase/use-user";
import {
  createAlertRule,
  deleteAlertRule,
  fetchAlertRules,
  type AlertCondition,
} from "@/lib/supabase/alert-rules";
import {
  toVotes,
  useCommitteeVerdicts,
  useTriggerCommitteeGeneration,
} from "@/lib/queries/committee-queries";

async function fetchYahooQuotes(symbols: string[]): Promise<YahooQuote[]> {
  const res = await fetch(`/api/yahoo/quotes?symbols=${symbols.map(encodeURIComponent).join(",")}`);
  if (!res.ok) throw new Error("quotes_failed");
  const data = await res.json();
  return data.quotes as YahooQuote[];
}

/** Real Yahoo quotes, keyed by symbol — used for indices Finnhub's free tier doesn't cover. */
export function useYahooQuotes(symbols: string[]) {
  return useQuery({
    queryKey: ["yahoo-quotes", ...symbols],
    queryFn: async () => {
      const quotes = await fetchYahooQuotes(symbols);
      return Object.fromEntries(quotes.map((q) => [q.symbol, q]));
    },
    enabled: symbols.length > 0,
    refetchInterval: 30_000,
  });
}

async function fetchCandles(symbol: string, range: ChartRange): Promise<Candle[]> {
  const res = await fetch(`/api/yahoo/candles?symbol=${encodeURIComponent(symbol)}&range=${range}`);
  if (!res.ok) throw new Error("candles_failed");
  const data = await res.json();
  return data.candles as Candle[];
}

/** Real close-price sparkline shapes, keyed by symbol. Handles symbols with special characters (e.g. "^GSPC"). */
export function useSparklines(symbols: string[], range: ChartRange = "1M") {
  const results = useQueries({
    queries: symbols.map((symbol) => ({
      queryKey: ["terminal-sparkline", symbol, range],
      queryFn: () => fetchCandles(symbol, range),
      staleTime: 60_000,
    })),
  });

  const map: Record<string, number[] | undefined> = {};
  symbols.forEach((symbol, i) => {
    const candles = results[i].data;
    map[symbol] = candles && candles.length > 0 ? candles.map((c) => c.close) : undefined;
  });
  return map;
}

/**
 * Drives the dashboard's "spotlight" committee panel for one ticker: reads
 * whatever real verdicts already exist, and — same as the asset detail page
 * — auto-triggers a fresh Gemini generation the first time a logged-in user
 * sees an asset with none yet.
 */
export function useSpotlightCommittee(ticker: string, name: string) {
  const { user, loading: userLoading } = useUser();
  const { data: rows, isPending } = useCommitteeVerdicts(ticker);
  const generateMutation = useTriggerCommitteeGeneration(ticker);
  const triggered = useRef(false);

  const votes = toVotes(rows ?? []);

  useEffect(() => {
    if (userLoading || !user) return;
    if (isPending || votes.length > 0 || triggered.current) return;
    triggered.current = true;
    generateMutation.mutate({ ticker, name });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoading, user, isPending, votes.length, ticker, name]);

  return {
    rows: rows ?? [],
    votes,
    isLive: votes.length > 0,
    isGenerating: generateMutation.isPending,
    generationFailed: generateMutation.isError,
    isLoggedIn: !userLoading && !!user,
    isPending: isPending || userLoading,
  };
}

/** The user's real configured price-alert rules — backs both the bell badge and its dropdown. */
export function useAlertRules() {
  const { user } = useUser();
  return useQuery({
    queryKey: ["alert-rules"],
    queryFn: fetchAlertRules,
    enabled: !!user,
  });
}

export function useAlertRuleCount() {
  const { data } = useAlertRules();
  return { data: data?.length };
}

export function useCreateAlertRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { ticker: string; name: string; condition: AlertCondition; threshold: number }) =>
      createAlertRule(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-rules"] });
    },
  });
}

export function useDeleteAlertRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAlertRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-rules"] });
    },
  });
}

async function fetchCompanyNews(symbol: string): Promise<FinnhubNewsItem[]> {
  const res = await fetch(`/api/finnhub/news?symbol=${symbol}`);
  if (!res.ok) throw new Error("news_failed");
  const data = await res.json();
  return data.news as FinnhubNewsItem[];
}

export function useCompanyNews(symbol: string) {
  return useQuery({
    queryKey: ["company-news", symbol],
    queryFn: () => fetchCompanyNews(symbol),
    staleTime: 5 * 60_000,
  });
}
