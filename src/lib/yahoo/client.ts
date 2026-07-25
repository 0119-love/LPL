import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export type ChartRange = "1D" | "1W" | "1M" | "3M" | "1Y";

const RANGE_CONFIG: Record<
  ChartRange,
  { interval: "5m" | "30m" | "1d" | "1wk"; days: number }
> = {
  "1D": { interval: "5m", days: 1 },
  "1W": { interval: "30m", days: 7 },
  "1M": { interval: "1d", days: 30 },
  "3M": { interval: "1d", days: 90 },
  "1Y": { interval: "1wk", days: 365 },
};

export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export async function getCandles(symbol: string, range: ChartRange): Promise<Candle[]> {
  const config = RANGE_CONFIG[range];
  const period1 = new Date(Date.now() - config.days * 24 * 60 * 60 * 1000);

  const chart = await yahooFinance.chart(symbol, {
    period1,
    interval: config.interval,
  });

  return chart.quotes
    .filter(
      (q): q is typeof q & {
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
      } =>
        q.open != null && q.high != null && q.low != null && q.close != null,
    )
    .map((q) => ({
      time: new Date(q.date).getTime(),
      open: q.open,
      high: q.high,
      low: q.low,
      close: q.close,
      volume: q.volume ?? 0,
    }));
}

export async function getFundamentals(symbol: string) {
  const summary = await yahooFinance.quoteSummary(symbol, {
    modules: ["financialData", "defaultKeyStatistics", "summaryDetail"],
  });

  return {
    currentPrice: summary.financialData?.currentPrice ?? null,
    targetMeanPrice: summary.financialData?.targetMeanPrice ?? null,
    recommendationKey: summary.financialData?.recommendationKey ?? null,
    numberOfAnalystOpinions: summary.financialData?.numberOfAnalystOpinions ?? null,
    totalRevenue: summary.financialData?.totalRevenue ?? null,
    revenuePerShare: summary.financialData?.revenuePerShare ?? null,
    grossMargins: summary.financialData?.grossMargins ?? null,
    ebitdaMargins: summary.financialData?.ebitdaMargins ?? null,
    debtToEquity: summary.financialData?.debtToEquity ?? null,
    currentRatio: summary.financialData?.currentRatio ?? null,
    trailingPE: summary.summaryDetail?.trailingPE ?? null,
    forwardPE: summary.summaryDetail?.forwardPE ?? null,
    dividendYield: summary.summaryDetail?.dividendYield ?? null,
    marketCap: summary.summaryDetail?.marketCap ?? null,
    fiftyTwoWeekHigh: summary.summaryDetail?.fiftyTwoWeekHigh ?? null,
    fiftyTwoWeekLow: summary.summaryDetail?.fiftyTwoWeekLow ?? null,
    trailingEps: summary.defaultKeyStatistics?.trailingEps ?? null,
    beta: summary.defaultKeyStatistics?.beta ?? null,
  };
}
