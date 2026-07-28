import type { Candle } from "@/lib/yahoo/client";

export type Signal = "buy" | "sell" | "neutral";
export type Verdict = "strong_buy" | "buy" | "neutral" | "sell" | "strong_sell";

export type IndicatorReading = {
  key: string;
  period: number;
  value: number;
  signal: Signal;
};

export type SignalGroup = {
  items: IndicatorReading[];
  buy: number;
  neutral: number;
  sell: number;
  ratio: number; // (buy - sell) / total, in [-1, 1]
  verdict: Verdict;
  gaugeValue: number; // 0..100, 50 = neutral center
};

export type TechnicalSummary = {
  sampleSize: number;
  oscillators: SignalGroup;
  movingAverages: SignalGroup;
  summary: SignalGroup;
};

const MA_PERIODS = [5, 10, 20, 50, 100, 200];

function sma(values: number[], period: number, endIndex: number): number | null {
  if (endIndex + 1 < period) return null;
  let sum = 0;
  for (let i = endIndex - period + 1; i <= endIndex; i++) sum += values[i];
  return sum / period;
}

function emaSeries(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = new Array(values.length).fill(null);
  if (values.length < period) return out;
  const k = 2 / (period + 1);
  let prev = sma(values, period, period - 1)!;
  out[period - 1] = prev;
  for (let i = period; i < values.length; i++) {
    prev = values[i] * k + prev * (1 - k);
    out[i] = prev;
  }
  return out;
}

function rsi(closes: number[], period: number): number | null {
  if (closes.length < period + 1) return null;
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1];
    if (change >= 0) avgGain += change;
    else avgLoss -= change;
  }
  avgGain /= period;
  avgLoss /= period;
  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    const gain = change >= 0 ? change : 0;
    const loss = change < 0 ? -change : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function stochasticK(candles: Candle[], period: number): number | null {
  if (candles.length < period) return null;
  const window = candles.slice(candles.length - period);
  const highestHigh = Math.max(...window.map((c) => c.high));
  const lowestLow = Math.min(...window.map((c) => c.low));
  const close = candles[candles.length - 1].close;
  if (highestHigh === lowestLow) return 50;
  return ((close - lowestLow) / (highestHigh - lowestLow)) * 100;
}

function cci(candles: Candle[], period: number): number | null {
  if (candles.length < period) return null;
  const typicalPrices = candles.map((c) => (c.high + c.low + c.close) / 3);
  const window = typicalPrices.slice(typicalPrices.length - period);
  const mean = window.reduce((a, b) => a + b, 0) / period;
  const meanDeviation = window.reduce((a, tp) => a + Math.abs(tp - mean), 0) / period;
  if (meanDeviation === 0) return 0;
  const lastTp = typicalPrices[typicalPrices.length - 1];
  return (lastTp - mean) / (0.015 * meanDeviation);
}

function williamsR(candles: Candle[], period: number): number | null {
  if (candles.length < period) return null;
  const window = candles.slice(candles.length - period);
  const highestHigh = Math.max(...window.map((c) => c.high));
  const lowestLow = Math.min(...window.map((c) => c.low));
  const close = candles[candles.length - 1].close;
  if (highestHigh === lowestLow) return -50;
  return ((highestHigh - close) / (highestHigh - lowestLow)) * -100;
}

function momentum(closes: number[], period: number): number | null {
  if (closes.length < period + 1) return null;
  return closes[closes.length - 1] - closes[closes.length - 1 - period];
}

function macdHistogram(closes: number[], fast: number, slow: number, signalPeriod: number): number | null {
  if (closes.length < slow + signalPeriod) return null;
  const emaFast = emaSeries(closes, fast);
  const emaSlow = emaSeries(closes, slow);
  const macdLine: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    const f = emaFast[i];
    const s = emaSlow[i];
    if (f != null && s != null) macdLine.push(f - s);
  }
  if (macdLine.length < signalPeriod) return null;
  const signalSeries = emaSeries(macdLine, signalPeriod);
  const lastSignal = signalSeries[signalSeries.length - 1];
  if (lastSignal == null) return null;
  return macdLine[macdLine.length - 1] - lastSignal;
}

function threshold(value: number, buyBelow: number, sellAbove: number): Signal {
  if (value <= buyBelow) return "buy";
  if (value >= sellAbove) return "sell";
  return "neutral";
}

function aroundZero(value: number): Signal {
  if (value > 0) return "buy";
  if (value < 0) return "sell";
  return "neutral";
}

function tally(items: IndicatorReading[]): SignalGroup {
  const buy = items.filter((i) => i.signal === "buy").length;
  const sell = items.filter((i) => i.signal === "sell").length;
  const neutral = items.length - buy - sell;
  const total = items.length;
  const ratio = total > 0 ? (buy - sell) / total : 0;
  const verdict: Verdict =
    ratio >= 0.6 ? "strong_buy" : ratio >= 0.2 ? "buy" : ratio > -0.2 ? "neutral" : ratio > -0.6 ? "sell" : "strong_sell";
  const gaugeValue = Math.max(0, Math.min(100, 50 + ratio * 50));
  return { items, buy, neutral, sell, ratio, verdict, gaugeValue };
}

// Every reading here is derived from real OHLC candles fetched for the
// selected chart range — periods that don't fit in the available history
// (e.g. a 200-period MA on a 1D intraday range) are simply omitted rather
// than faked, so the gauge count shrinks honestly on short ranges.
export function buildTechnicalSummary(candles: Candle[]): TechnicalSummary | null {
  if (candles.length < 5) return null;
  const closes = candles.map((c) => c.close);
  const lastClose = closes[closes.length - 1];

  const maItems: IndicatorReading[] = [];
  for (const period of MA_PERIODS) {
    const smaValue = sma(closes, period, closes.length - 1);
    if (smaValue != null) {
      maItems.push({ key: `sma${period}`, period, value: smaValue, signal: aroundZero(lastClose - smaValue) });
    }
    const emaValue = emaSeries(closes, period)[closes.length - 1];
    if (emaValue != null) {
      maItems.push({ key: `ema${period}`, period, value: emaValue, signal: aroundZero(lastClose - emaValue) });
    }
  }

  const oscItems: IndicatorReading[] = [];
  const rsiValue = rsi(closes, 14);
  if (rsiValue != null) oscItems.push({ key: "rsi14", period: 14, value: rsiValue, signal: threshold(rsiValue, 30, 70) });

  const stochValue = stochasticK(candles, 14);
  if (stochValue != null) oscItems.push({ key: "stoch14", period: 14, value: stochValue, signal: threshold(stochValue, 20, 80) });

  const cciValue = cci(candles, 20);
  if (cciValue != null) oscItems.push({ key: "cci20", period: 20, value: cciValue, signal: threshold(cciValue, -100, 100) });

  const williamsValue = williamsR(candles, 14);
  if (williamsValue != null)
    oscItems.push({ key: "williams14", period: 14, value: williamsValue, signal: threshold(williamsValue, -80, -20) });

  const momentumValue = momentum(closes, 10);
  if (momentumValue != null)
    oscItems.push({ key: "momentum10", period: 10, value: momentumValue, signal: aroundZero(momentumValue) });

  const macdValue = macdHistogram(closes, 12, 26, 9);
  if (macdValue != null) oscItems.push({ key: "macd", period: 12, value: macdValue, signal: aroundZero(macdValue) });

  const oscillators = tally(oscItems);
  const movingAverages = tally(maItems);
  const summary = tally([...oscItems, ...maItems]);

  return { sampleSize: candles.length, oscillators, movingAverages, summary };
}
