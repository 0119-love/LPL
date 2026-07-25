import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FinnhubQuote, FinnhubSearchResult } from "@/lib/finnhub/client";
import {
  addToWatchlist,
  fetchWatchlist,
  removeFromWatchlist,
} from "@/lib/supabase/watchlist";

export const marketKeys = {
  watchlist: ["watchlist"] as const,
  quotes: (tickers: string[]) => ["quotes", ...tickers.sort()] as const,
  search: (query: string) => ["symbol-search", query] as const,
};

export function useWatchlist() {
  return useQuery({
    queryKey: marketKeys.watchlist,
    queryFn: fetchWatchlist,
  });
}

export function useAddToWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticker, name }: { ticker: string; name: string }) =>
      addToWatchlist(ticker, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketKeys.watchlist });
    },
  });
}

export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (watchlistId: string) => removeFromWatchlist(watchlistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketKeys.watchlist });
    },
  });
}

async function fetchQuote(ticker: string): Promise<FinnhubQuote> {
  const res = await fetch(`/api/finnhub/quote?symbol=${ticker}`);
  if (!res.ok) throw new Error("quote_failed");
  return res.json();
}

export function useQuotes(tickers: string[]) {
  return useQuery({
    queryKey: marketKeys.quotes(tickers),
    queryFn: async () => {
      const entries = await Promise.all(
        tickers.map(async (ticker) => [ticker, await fetchQuote(ticker)] as const),
      );
      return Object.fromEntries(entries) as Record<string, FinnhubQuote>;
    },
    enabled: tickers.length > 0,
    refetchInterval: 15_000,
  });
}

async function searchSymbols(query: string): Promise<FinnhubSearchResult> {
  const res = await fetch(`/api/finnhub/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("search_failed");
  return res.json();
}

export function useSymbolSearch(query: string) {
  return useQuery({
    queryKey: marketKeys.search(query),
    queryFn: () => searchSymbols(query),
    enabled: query.trim().length > 0,
    staleTime: 60_000,
  });
}
