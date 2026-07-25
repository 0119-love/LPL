"use client";

import { useTranslations } from "next-intl";

export function DashboardErrorFallback() {
  const t = useTranslations("Common");

  return (
    <div className="flex h-dvh w-full items-center justify-center bg-background px-4">
      <div className="text-center">
        <p className="text-sm text-nobuy">{t("errorGeneric")}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background"
        >
          {t("retry")}
        </button>
      </div>
    </div>
  );
}
