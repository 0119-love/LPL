import { useQuery, type QueryClient } from "@tanstack/react-query";
import { alerts } from "@/lib/mock/data";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const dashboardKeys = {
  alerts: ["dashboard", "alerts"] as const,
};

async function fetchAlerts() {
  await wait(150);
  return alerts;
}

export function useAlerts() {
  return useQuery({ queryKey: dashboardKeys.alerts, queryFn: fetchAlerts });
}

export function prefetchDashboard(queryClient: QueryClient) {
  return queryClient.prefetchQuery({ queryKey: dashboardKeys.alerts, queryFn: fetchAlerts });
}
