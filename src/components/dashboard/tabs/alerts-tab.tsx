"use client";

import { clsx } from "clsx";
import { useTranslations } from "next-intl";
import { useAlerts } from "@/lib/queries/dashboard-queries";
import { GlassCard } from "@/components/ui/glass-card";

export function AlertsTab() {
  const t = useTranslations("Dashboard.alerts");
  const { data: alerts, isPending } = useAlerts();

  if (isPending) {
    return <p className="text-sm text-foreground-muted">…</p>;
  }

  if (!alerts?.length) {
    return <p className="text-sm text-foreground-muted">—</p>;
  }

  return (
    <div className="flex flex-col gap-3 max-w-2xl">
      {alerts.map((alert) => (
        <GlassCard
          key={alert.id}
          strong
          className={clsx(
            "border-l-2",
            alert.severity === "high" ? "border-l-nobuy" : "border-l-buy",
          )}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-foreground-muted">
                {alert.assetTicker} ·{" "}
                {alert.type === "activity"
                  ? t("capacityIssue")
                  : t("scheduleDeviation")}
              </p>
              <p className="mt-1 font-medium">{alert.title}</p>
              <p className="mt-1 text-sm text-foreground-muted">
                {alert.detail}
              </p>
            </div>
            <span
              className={clsx(
                "shrink-0 rounded-full h-5 w-5 grid place-items-center text-xs font-medium",
                alert.severity === "high"
                  ? "bg-nobuy-soft text-nobuy"
                  : "bg-buy-soft text-buy",
              )}
            >
              !
            </span>
          </div>
          <p className="mt-2 text-xs text-foreground-muted">
            {alert.minutesAgo}
            {t("minutesAgo")}
          </p>
        </GlassCard>
      ))}
    </div>
  );
}
