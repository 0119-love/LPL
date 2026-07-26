// Mock data for the Verdict Intelligence Terminal dashboard (design-first
// pass). Shapes are intentionally close to what the real data layer already
// produces (Finnhub quotes, yahoo candles, committee_verdicts rows) so
// swapping in live data later is a data-fetching change, not a UI rewrite.

const spark = (base: number, points: number, drift: number, seed = 1) =>
  Array.from({ length: points }, (_, i) =>
    Math.max(1, base + Math.sin((i + seed) / 2.3) * drift + i * (drift / points)),
  );

export type MarketIndex = {
  symbol: string;
  value: string;
  changePct: number;
  spark: number[];
};

export const marketIndices: MarketIndex[] = [
  { symbol: "S&P 500", value: "5,982.72", changePct: 0.84, spark: spark(60, 20, 6, 1) },
  { symbol: "NASDAQ", value: "19,442.10", changePct: 1.21, spark: spark(55, 20, 8, 2) },
  { symbol: "DOW JONES", value: "44,554.78", changePct: 0.31, spark: spark(58, 20, 3, 3) },
  { symbol: "VIX", value: "16.42", changePct: -6.42, spark: spark(60, 20, -10, 4) },
  { symbol: "10Y YIELD", value: "4.18%", changePct: 0.02, spark: spark(50, 20, 1, 5) },
];

export const marketRegime = {
  label: "RISK-ON",
  score: 72,
  maxScore: 100,
  caption: "Risk-on conditions across equities, credit, and volatility.",
  breakdown: [
    { label: "Momentum", value: 72, note: "Bullish" },
    { label: "Liquidity", value: 68, note: "Neutral" },
    { label: "Volatility", value: 28, note: "Low" },
    { label: "Breadth", value: 64, note: "Bullish" },
  ],
};

export type CommitteeAnalyst = {
  id: string;
  name: string;
  role: string;
  verdict: "BUY" | "HOLD" | "SELL";
  score: number;
};

// Same 5 people as the real committee (lib/committee/members.ts), reframed
// with terminal-style functional role labels for this design.
export const committeeAnalysts: CommitteeAnalyst[] = [
  { id: "m1", name: "Kang", role: "Chart Analyst", verdict: "BUY", score: 84 },
  { id: "m2", name: "Lee", role: "News Analyst", verdict: "BUY", score: 77 },
  { id: "m3", name: "Park", role: "Fundamental Analyst", verdict: "HOLD", score: 61 },
  { id: "m4", name: "Sofia", role: "Market Strategist", verdict: "BUY", score: 81 },
  { id: "m5", name: "Devon", role: "Deep Research", verdict: "BUY", score: 89 },
];

export const committeeVerdict = {
  label: "BULLISH" as const,
  score: 78,
  agree: 4,
  total: 5,
  confidence: 82,
};

export const radarDimensions = [
  { dimension: "Chart", value: 84 },
  { dimension: "News", value: 77 },
  { dimension: "Finance", value: 61 },
  { dimension: "Market", value: 81 },
  { dimension: "Deep Research", value: 89 },
];

export type Opportunity = {
  rank: number;
  ticker: string;
  name: string;
  score: number;
  changePct: number;
  tags: string[];
  spark: number[];
};

export const opportunities: Opportunity[] = [
  {
    rank: 1,
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    score: 92,
    changePct: 3.21,
    tags: ["AI Demand", "Earnings Revision", "Momentum"],
    spark: spark(60, 16, 9, 6),
  },
  {
    rank: 2,
    ticker: "AMD",
    name: "Advanced Micro Devices",
    score: 87,
    changePct: 2.14,
    tags: ["Momentum", "Institutional Flow", "Breakout"],
    spark: spark(55, 16, 6, 7),
  },
  {
    rank: 3,
    ticker: "AVGO",
    name: "Broadcom Inc.",
    score: 84,
    changePct: 1.87,
    tags: ["AI Infrastructure", "Strong Guidance", "Growth"],
    spark: spark(58, 16, 5, 8),
  },
];

export type CapitalFlowNode = {
  id: string;
  label: string;
  sublabel: string;
  netFlow: number;
  x: number;
  y: number;
};

export const capitalFlowNodes: CapitalFlowNode[] = [
  { id: "na", label: "NORTH AMERICA", sublabel: "Net Inflow", netFlow: 12.4, x: 18, y: 62 },
  { id: "eu", label: "EUROPE", sublabel: "Net Inflow", netFlow: 3.2, x: 50, y: 38 },
  { id: "asia", label: "ASIA", sublabel: "Net Inflow", netFlow: 8.7, x: 82, y: 52 },
  { id: "em", label: "EMERGING MARKETS", sublabel: "Net Outflow", netFlow: -2.1, x: 58, y: 78 },
];

export type CapitalFlowLink = {
  from: string;
  to: string;
  strength: "strong" | "normal" | "outflow";
};

export const capitalFlowLinks: CapitalFlowLink[] = [
  { from: "na", to: "eu", strength: "normal" },
  { from: "eu", to: "asia", strength: "strong" },
  { from: "na", to: "asia", strength: "normal" },
  { from: "em", to: "asia", strength: "outflow" },
];

export type IntelligenceEvent = {
  id: string;
  time: string;
  type: "opportunity" | "risk" | "shift" | "development";
  title: string;
  confidence: number;
};

export const intelligenceFeed: IntelligenceEvent[] = [
  {
    id: "ev1",
    time: "07:01 PM",
    type: "opportunity",
    title: "AI infrastructure momentum is accelerating",
    confidence: 87,
  },
  {
    id: "ev2",
    time: "06:45 PM",
    type: "risk",
    title: "Treasury yield approaching critical resistance",
    confidence: 72,
  },
  {
    id: "ev3",
    time: "06:32 PM",
    type: "shift",
    title: "Capital rotation detected into semiconductor sector",
    confidence: 81,
  },
  {
    id: "ev4",
    time: "06:12 PM",
    type: "development",
    title: "Strong earnings revisions across tech megacaps",
    confidence: 79,
  },
];

export const portfolioPulse = {
  totalValue: 42840.72,
  changePct: 2.41,
  spark: spark(50, 24, 7, 9),
  riskScore: 38,
  riskMax: 100,
  riskLabel: "Moderate",
  sharpeRatio: 1.42,
  sharpeLabel: "Good",
  maxDrawdownPct: -8.21,
  drawdownLabel: "Acceptable",
  cashPosition: 5400.12,
  cashPct: 12.6,
};

export type MarketMover = {
  ticker: string;
  price: number;
  changePct: number;
};

export const marketMovers: MarketMover[] = [
  { ticker: "AAPL", price: 214.29, changePct: 1.32 },
  { ticker: "MSFT", price: 445.15, changePct: 0.88 },
  { ticker: "GOOGL", price: 191.89, changePct: 1.45 },
  { ticker: "AMZN", price: 214.65, changePct: 1.21 },
  { ticker: "META", price: 525.41, changePct: 1.08 },
  { ticker: "TSLA", price: 265.34, changePct: -1.34 },
  { ticker: "NVDA", price: 128.76, changePct: 3.21 },
];

export type SidebarNavItem = { id: string; label: string };
export type SidebarGroup = { title: string; items: SidebarNavItem[] };

export const sidebarGroups: SidebarGroup[] = [
  { title: "Overview", items: [{ id: "command", label: "Command Board" }] },
  {
    title: "Market Intelligence",
    items: [
      { id: "markets", label: "Markets" },
      { id: "sectors", label: "Sectors" },
      { id: "assets", label: "Assets" },
      { id: "map", label: "Global Map" },
    ],
  },
  {
    title: "AI Intelligence",
    items: [
      { id: "intelligence", label: "Intelligence Feed" },
      { id: "committee", label: "Committee" },
      { id: "research", label: "Research Hub" },
      { id: "news", label: "News Scanner" },
    ],
  },
  {
    title: "Portfolio",
    items: [
      { id: "portfolio", label: "Portfolio" },
      { id: "watchlist", label: "Watchlist" },
      { id: "positions", label: "Positions" },
      { id: "performance", label: "Performance" },
    ],
  },
  {
    title: "Alerts & Signals",
    items: [
      { id: "alerts", label: "Alerts" },
      { id: "signals", label: "Signal Center" },
    ],
  },
];
