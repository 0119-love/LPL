import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAlertRule, deleteAlertRule, fetchAlertRules } from "@/lib/supabase/alert-rules";

const key = ["alert-rules"] as const;

export function useAlertRules() {
  return useQuery({ queryKey: key, queryFn: fetchAlertRules });
}

export function useCreateAlertRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAlertRule,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useDeleteAlertRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAlertRule,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
