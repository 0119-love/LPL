import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchHoldings,
  fetchSnapshots,
  fetchTransactions,
  recordSnapshot,
  recordTransaction,
} from "@/lib/supabase/portfolio";

export const portfolioKeys = {
  holdings: ["portfolio-holdings"] as const,
  transactions: ["portfolio-transactions"] as const,
  snapshots: ["portfolio-snapshots"] as const,
};

export function usePortfolioHoldings() {
  return useQuery({ queryKey: portfolioKeys.holdings, queryFn: fetchHoldings });
}

export function usePortfolioTransactions() {
  return useQuery({ queryKey: portfolioKeys.transactions, queryFn: fetchTransactions });
}

export function usePortfolioSnapshots() {
  return useQuery({ queryKey: portfolioKeys.snapshots, queryFn: fetchSnapshots });
}

export function useRecordTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recordTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portfolioKeys.holdings });
      queryClient.invalidateQueries({ queryKey: portfolioKeys.transactions });
    },
  });
}

export function useRecordSnapshot() {
  return useMutation({
    mutationFn: (totalValue: number) => recordSnapshot(totalValue),
  });
}
