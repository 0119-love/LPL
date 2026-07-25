"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { useTranslations } from "next-intl";
import { useCandles } from "@/lib/queries/asset-queries";
import { CandlestickChart } from "./candlestick-chart";
import { VolumeChart } from "./volume-chart";
import type { ChartRange } from "@/lib/yahoo/client";

const RANGES: ChartRange[] = ["1D", "1W", "1M", "3M", "1Y"];

export function PriceChart({ ticker }: { ticker: string }) {
  const t = useTranslations("Asset");
  const [range, setRange] = useState<ChartRange>("1M");
  const { data: candles, isPending, isError } = useCandles(ticker, range);

  return (
    <div>
      <div className="flex gap-1">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={clsx(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              r === range
                ? "bg-white/10 text-foreground"
                : "text-foreground-muted hover:text-foreground",
            )}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="mt-2">
        {isPending && (
          <div className="flex h-[344px] items-center justify-center text-sm text-foreground-muted">
            …
          </div>
        )}
        {isError && (
          <div className="flex h-[344px] items-center justify-center text-sm text-foreground-muted">
            {t("chartError")}
          </div>
        )}
        {candles && candles.length === 0 && (
          <div className="flex h-[344px] items-center justify-center text-sm text-foreground-muted">
            {t("chartEmpty")}
          </div>
        )}
        {candles && candles.length > 0 && (
          <>
            <CandlestickChart candles={candles} range={range} />
            <VolumeChart candles={candles} />
          </>
        )}
      </div>
    </div>
  );
}
