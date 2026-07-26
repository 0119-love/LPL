import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/ui/glass-card";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { Sparkline } from "@/components/ui/sparkline";
import { heroSample } from "./hero-sample-data";

// Reference frame: 198 x 177 — the hero's "main dashboard" preview.
// Kept at that exact aspect ratio (198/177) and scaled responsively via max-width.
export function HeroDashboardFrame() {
  const t = useTranslations("DashboardPreview");
  const buyCount = heroSample.votes.filter((v) => v === "buy").length;
  const verdict =
    buyCount > heroSample.votes.length / 2
      ? "buy"
      : buyCount < heroSample.votes.length / 2
        ? "no_buy"
        : "split";

  return (
    <div className="mx-auto w-full max-w-[560px]">
      <div className="rounded-2xl border border-border-subtle bg-background-elevated p-2 shadow-2xl shadow-black/40">
        <div className="flex items-center gap-1.5 px-2 py-1.5">
          <span className="h-2 w-2 rounded-full bg-nobuy/60" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-buy/60" />
        </div>

        <div className="aspect-[198/177] w-full overflow-hidden rounded-lg bg-background p-3 md:p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-xs text-foreground-muted">
              {t("label")}
            </span>
            <span className="flex items-center gap-1 text-[10px] md:text-xs text-buy">
              <span className="h-1.5 w-1.5 rounded-full bg-buy animate-pulse" />
              {t("liveBadge")}
            </span>
          </div>

          <GlassCard strong className="flex-1 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] md:text-xs text-foreground-muted">
                  {heroSample.ticker}
                </p>
                <p className="text-lg md:text-2xl font-semibold tabular-nums">
                  ${heroSample.price.toFixed(2)}
                </p>
              </div>
              <VerdictBadge
                verdict={verdict}
                label={verdict === "buy" ? "BUY" : "NO-BUY"}
              />
            </div>
            <Sparkline
              data={heroSample.sparkline}
              positive={heroSample.changePct >= 0}
              width={220}
              height={40}
            />
            <div className="flex -space-x-1.5">
              {heroSample.votes.map((v, i) => (
                <div
                  key={i}
                  className={
                    v === "buy"
                      ? "h-5 w-5 md:h-6 md:w-6 rounded-full border-2 border-background-elevated bg-buy-soft text-buy text-[9px] font-medium grid place-items-center"
                      : "h-5 w-5 md:h-6 md:w-6 rounded-full border-2 border-background-elevated bg-nobuy-soft text-nobuy text-[9px] font-medium grid place-items-center"
                  }
                >
                  {v === "buy" ? "B" : "N"}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
