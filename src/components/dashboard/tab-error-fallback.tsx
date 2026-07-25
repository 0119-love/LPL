"use client";

import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/ui/glass-card";

export function TabErrorFallback() {
  const t = useTranslations("Common");

  return (
    <GlassCard className="max-w-md">
      <p className="text-sm text-nobuy">{t("errorGeneric")}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-2 text-xs text-foreground-muted underline hover:text-foreground"
      >
        {t("retry")}
      </button>
    </GlassCard>
  );
}
