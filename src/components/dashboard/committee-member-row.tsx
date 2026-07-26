"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { committeeMembers } from "@/lib/committee/members";
import type { Vote } from "@/lib/committee/types";
import { computeAccuracy } from "@/lib/verdict-accuracy";
import type { Candle } from "@/lib/yahoo/client";

export function CommitteeMemberRow({ vote, candles }: { vote: Vote; candles?: Candle[] }) {
  const t = useTranslations("Dashboard.committee");
  const [open, setOpen] = useState(false);
  const member = committeeMembers.find((m) => m.id === vote.memberId);
  const accuracy = computeAccuracy(candles, vote.history);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 text-left"
      >
        <div
          className={clsx(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium",
            vote.verdict === "buy" ? "bg-buy-soft text-buy" : "bg-nobuy-soft text-nobuy",
          )}
        >
          {member?.initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm">
            {member?.name}
            <span
              className={clsx("ml-2 text-xs", vote.verdict === "buy" ? "text-buy" : "text-nobuy")}
            >
              {vote.verdict === "buy" ? t("buy") : t("noBuy")}
            </span>
          </p>
          <p className="text-xs text-foreground-muted">{vote.rationale}</p>
        </div>
        <ChevronDown
          size={16}
          className={clsx(
            "mt-1 shrink-0 text-foreground-muted transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="ml-10 mt-2 flex flex-col gap-3 border-l border-border-subtle pl-3">
          <p className="text-xs text-foreground-muted leading-relaxed">{vote.detail}</p>
          <span className="inline-block w-fit rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-foreground-muted">
            {vote.relatedMetric}
          </span>

          {accuracy.length > 0 && (
            <div>
              <p className="mb-1.5 text-[11px] text-foreground-muted">{t("historyLabel")}</p>
              <div className="flex flex-col gap-1">
                {accuracy.map((a) => (
                  <div key={a.daysAgo} className="flex items-center justify-between text-xs">
                    <span className="text-foreground-muted">
                      {Math.round(a.daysAgo)}
                      {t("daysAgoSuffix")} · {a.verdict === "buy" ? t("buy") : t("noBuy")}
                    </span>
                    <span className={a.correct ? "text-buy" : "text-nobuy"}>
                      {a.correct ? t("correct") : t("incorrect")} ({a.changePct >= 0 ? "+" : ""}
                      {a.changePct.toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
