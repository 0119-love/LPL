"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { ChevronDown, Lightbulb, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAlerts } from "@/lib/queries/dashboard-queries";
import { GlassCard } from "@/components/ui/glass-card";
import { Link } from "@/i18n/navigation";
import { useUser } from "@/lib/supabase/use-user";
import { useReadAlerts } from "@/lib/use-read-alerts";
import { AlertRuleForm } from "@/components/dashboard/alert-rule-form";
import { AlertRuleList } from "@/components/dashboard/alert-rule-list";
import type { AlertItem } from "@/lib/mock/data";

export function AlertsTab() {
  const t = useTranslations("Dashboard.alerts");
  const { data: alerts, isPending } = useAlerts();
  const [collapsed, setCollapsed] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const { readIds, toggleRead } = useReadAlerts();
  const { user, loading: userLoading } = useUser();

  if (isPending) {
    return <p className="text-sm text-foreground-muted">…</p>;
  }

  const visibleAlerts =
    filter === "unread" ? (alerts ?? []).filter((a) => !readIds.has(a.id)) : alerts ?? [];
  const highCount = visibleAlerts.filter((a) => a.severity === "high").length;

  return (
    <div className="flex flex-col gap-4">
      {alerts && alerts.length > 0 && (
        <GlassCard strong className="max-w-2xl !p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="flex items-center gap-2 text-sm font-medium"
            >
              {t("title")}
              {highCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-nobuy-soft px-1.5 text-[11px] font-semibold text-nobuy">
                  {highCount}
                </span>
              )}
              <ChevronDown
                size={16}
                className={clsx(
                  "text-foreground-muted transition-transform",
                  collapsed && "-rotate-180",
                )}
              />
            </button>

            <div className="flex rounded-full border border-border-subtle p-0.5 text-[11px]">
              <button
                onClick={() => setFilter("all")}
                className={clsx(
                  "rounded-full px-2.5 py-1",
                  filter === "all" ? "bg-white/10 text-foreground" : "text-foreground-muted",
                )}
              >
                {t("filterAll")}
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={clsx(
                  "rounded-full px-2.5 py-1",
                  filter === "unread" ? "bg-white/10 text-foreground" : "text-foreground-muted",
                )}
              >
                {t("filterUnread")}
              </button>
            </div>
          </div>

          {!collapsed && (
            <div className="divide-y divide-border-subtle">
              {visibleAlerts.map((alert) => (
                <AlertRow
                  key={alert.id}
                  alert={alert}
                  read={readIds.has(alert.id)}
                  onToggleRead={() => toggleRead(alert.id)}
                />
              ))}
            </div>
          )}
        </GlassCard>
      )}

      <div className="max-w-2xl">
        <p className="mb-2 text-sm text-foreground-muted">{t("myRules")}</p>
        {!userLoading && !user && (
          <GlassCard>
            <p className="text-sm">{t("loginRequired")}</p>
            <Link
              href="/login"
              className="mt-3 inline-block rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background"
            >
              {t("loginCta")}
            </Link>
          </GlassCard>
        )}
        {user && (
          <GlassCard className="flex flex-col gap-4">
            <AlertRuleForm />
            <AlertRuleList />
          </GlassCard>
        )}
      </div>
    </div>
  );
}

function AlertRow({
  alert,
  read,
  onToggleRead,
}: {
  alert: AlertItem;
  read: boolean;
  onToggleRead: () => void;
}) {
  const t = useTranslations("Dashboard.alerts");
  const high = alert.severity === "high";

  return (
    <div className={clsx("flex items-start gap-2.5 px-4 py-3", read && "opacity-50")}>
      <span
        className={clsx(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
          high ? "bg-nobuy-soft text-nobuy" : "bg-buy-soft text-buy",
        )}
      >
        !
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-foreground-muted">
            {alert.assetTicker} ·{" "}
            {alert.type === "activity" ? t("capacityIssue") : t("scheduleDeviation")}
            {!read && (
              <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-buy align-middle" />
            )}
          </p>
          <span className="shrink-0 text-[11px] text-foreground-muted">
            {alert.minutesAgo}
            {t("minutesAgo")}
          </span>
        </div>

        <div
          className={clsx(
            "mt-1.5 border-l pl-3",
            high ? "border-l-nobuy/40" : "border-l-buy/40",
          )}
        >
          <p className="text-sm font-medium">{alert.title}</p>
          <p className="mt-0.5 text-xs text-foreground-muted">{alert.detail}</p>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-[11px] text-foreground-muted">
            <Lightbulb size={12} strokeWidth={2} className="shrink-0 text-buy" />
            <span className="font-medium text-foreground">{t("recommend")}</span>
            {t(alert.type === "activity" ? "recommendActivity" : "recommendSentiment")}
          </p>
          <button
            onClick={onToggleRead}
            className="flex shrink-0 items-center gap-1 text-[11px] text-foreground-muted hover:text-foreground"
          >
            <Check size={12} />
            {read ? t("markUnread") : t("markRead")}
          </button>
        </div>
      </div>
    </div>
  );
}
