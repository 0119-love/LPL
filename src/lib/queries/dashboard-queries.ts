import { useQuery, type QueryClient } from "@tanstack/react-query";
import { alerts, assets, portfolio } from "@/lib/mock/data";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const dashboardKeys = {
  assets: ["dashboard", "assets"] as const,
  alerts: ["dashboard", "alerts"] as const,
  portfolio: ["dashboard", "portfolio"] as const,
};

async function fetchAssets() {
  await wait(150);
  return assets;
}

async function fetchAlerts() {
  await wait(150);
  return alerts;
}

async function fetchPortfolio() {
  await wait(150);
  return portfolio;
}

export function useAssets() {
  return useQuery({ queryKey: dashboardKeys.assets, queryFn: fetchAssets });
}

export function useAlerts() {
  return useQuery({ queryKey: dashboardKeys.alerts, queryFn: fetchAlerts });
}

export function usePortfolio() {
  return useQuery({ queryKey: dashboardKeys.portfolio, queryFn: fetchPortfolio });
}

export function prefetchDashboard(queryClient: QueryClient) {
  return Promise.all([
    queryClient.prefetchQuery({ queryKey: dashboardKeys.assets, queryFn: fetchAssets }),
    queryClient.prefetchQuery({ queryKey: dashboardKeys.alerts, queryFn: fetchAlerts }),
    queryClient.prefetchQuery({ queryKey: dashboardKeys.portfolio, queryFn: fetchPortfolio }),
  ]);
}
