import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FinnhubProfile, FinnhubQuote, FinnhubSearchResult } from "@/lib/finnhub/client";
import {
  addToWatchlist,
  fetchWatchlist,
  removeFromWatchlist,
} from "@/lib/supabase/watchlist";

export const marketKeys = {
  watchlist: ["watchlist"] as const,
  quotes: (tickers: string[]) => ["quotes", ...tickers.sort()] as const,
  logos: (tickers: string[]) => ["logos", ...tickers.sort()] as const,
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

async function fetchProfile(ticker: string): Promise<FinnhubProfile> {
  const res = await fetch(`/api/finnhub/profile?symbol=${ticker}`);
  if (!res.ok) throw new Error("profile_failed");
  return res.json();
}

// One ticker missing a logo shouldn't blank out the rest, so failures are
// swallowed per-ticker instead of failing the whole batch.
export function useLogos(tickers: string[]) {
  return useQuery({
    queryKey: marketKeys.logos(tickers),
    queryFn: async () => {
      const entries = await Promise.all(
        tickers.map(async (ticker) => {
          try {
            const profile = await fetchProfile(ticker);
            return [ticker, profile.logo || undefined] as const;
          } catch {
            return [ticker, undefined] as const;
          }
        }),
      );
      return Object.fromEntries(entries) as Record<string, string | undefined>;
    },
    enabled: tickers.length > 0,
    staleTime: 24 * 60 * 60 * 1000,
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
