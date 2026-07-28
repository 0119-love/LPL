"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/ui/glass-card";
import { useCandles } from "@/lib/queries/asset-queries";
import { buildTechnicalSummary, type SignalGroup, type Verdict } from "@/lib/asset/technical-analysis";
import { SignalGauge } from "./signal-gauge";
import type { ChartRange } from "@/lib/yahoo/client";

const RANGES: ChartRange[] = ["1D", "1W", "1M", "3M", "1Y"];

const VERDICT_TEXT_CLASS: Record<Verdict, string> = {
  strong_buy: "text-buy",
  buy: "text-buy",
  neutral: "text-foreground-muted",
  sell: "text-nobuy",
  strong_sell: "text-nobuy",
};

function GaugeCell({
  title,
  group,
  emphasize = false,
}: {
  title: string;
  group: SignalGroup;
  emphasize?: boolean;
}) {
  const t = useTranslations("Asset");
  const verdictLabel = {
    strong_buy: t("technicalStrongBuy"),
    buy: t("technicalBuy"),
    neutral: t("technicalNeutral"),
    sell: t("technicalSell"),
    strong_sell: t("technicalStrongSell"),
  }[group.verdict];

  return (
    <div className="flex flex-col items-center">
      <p className="text-[11px] font-medium text-foreground-muted">{title}</p>
      <SignalGauge
        value={group.gaugeValue}
        verdict={group.verdict}
        size={emphasize ? 152 : 128}
        label={
          <p className={clsx("font-semibold", emphasize ? "text-base" : "text-sm", VERDICT_TEXT_CLASS[group.verdict])}>
            {verdictLabel}
          </p>
        }
      />
      <div className="mt-3 grid w-full grid-cols-3 gap-1 text-center">
        <div>
          <p className="text-nobuy text-sm font-semibold tabular-nums">{group.sell}</p>
          <p className="text-[10px] text-foreground-muted">{t("technicalSell")}</p>
        </div>
        <div>
          <p className="text-sm font-semibold tabular-nums">{group.neutral}</p>
          <p className="text-[10px] text-foreground-muted">{t("technicalNeutral")}</p>
        </div>
        <div>
          <p className="text-buy text-sm font-semibold tabular-nums">{group.buy}</p>
          <p className="text-[10px] text-foreground-muted">{t("technicalBuy")}</p>
        </div>
      </div>
    </div>
  );
}

export function TechnicalSummaryPanel({ ticker }: { ticker: string }) {
  const t = useTranslations("Asset");
  const [range, setRange] = useState<ChartRange>("1D");
  const { data: candles, isPending, isError } = useCandles(ticker, range);

  const summary = candles ? buildTechnicalSummary(candles) : null;

  return (
    <GlassCard strong>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium">{t("technicalTitle")}</p>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={clsx(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                r === range ? "bg-white/10 text-foreground" : "text-foreground-muted hover:text-foreground",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        {isPending && <p className="text-sm text-foreground-muted">…</p>}
        {isError && <p className="text-sm text-foreground-muted">{t("technicalError")}</p>}
        {!isPending && !isError && !summary && (
          <p className="text-sm text-foreground-muted">{t("technicalInsufficientData")}</p>
        )}
        {summary && (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:items-start">
              <GaugeCell title={t("technicalOscillators")} group={summary.oscillators} />
              <GaugeCell title={t("technicalSummary")} group={summary.summary} emphasize />
              <GaugeCell title={t("technicalMovingAverages")} group={summary.movingAverages} />
            </div>
            <p className="mt-5 text-center text-[11px] text-foreground-muted">
              {t("technicalSampleNote", { count: summary.sampleSize })}
            </p>
          </>
        )}
      </div>
    </GlassCard>
  );
}
