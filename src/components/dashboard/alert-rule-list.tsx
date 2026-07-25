"use client";

import { clsx } from "clsx";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAlertRules, useDeleteAlertRule } from "@/lib/queries/alert-rules-queries";
import { useQuotes } from "@/lib/queries/market-queries";

export function AlertRuleList() {
  const t = useTranslations("Dashboard.alerts");
  const { data: rules, isPending } = useAlertRules();
  const tickers = rules?.map((r) => r.ticker) ?? [];
  const { data: quotes } = useQuotes(tickers);
  const deleteMutation = useDeleteAlertRule();

  if (isPending) {
    return <p className="text-sm text-foreground-muted">…</p>;
  }

  if (!rules?.length) {
    return <p className="text-sm text-foreground-muted">{t("emptyRules")}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {rules.map((rule) => {
        const price = quotes?.[rule.ticker]?.c;
        const triggered =
          price != null &&
          (rule.condition === "price_above" ? price > rule.threshold : price < rule.threshold);

        return (
          <div
            key={rule.id}
            className={clsx(
              "flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors",
              triggered ? "border-buy/40 bg-buy-soft" : "border-border-subtle hover:border-white/20",
            )}
          >
            <div>
              <p className="font-medium">
                {rule.ticker}{" "}
                <span className="font-normal text-foreground-muted">
                  {rule.condition === "price_above" ? t("priceAbove") : t("priceBelow")} $
                  {rule.threshold.toFixed(2)}
                </span>
              </p>
              <p className="text-xs text-foreground-muted">
                {t("currentPrice")}: {price != null ? `$${price.toFixed(2)}` : "…"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={clsx(
                  "flex items-center gap-1.5 text-xs",
                  triggered ? "text-buy" : "text-foreground-muted",
                )}
              >
                {triggered && (
                  <span className="h-1.5 w-1.5 rounded-full bg-buy shadow-[0_0_6px_var(--accent-buy)]" />
                )}
                {triggered ? t("triggered") : t("waiting")}
              </span>
              <button
                onClick={() => deleteMutation.mutate(rule.id)}
                className="text-foreground-muted hover:text-nobuy"
                aria-label={t("deleteRule")}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
