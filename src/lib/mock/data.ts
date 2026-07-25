export type Verdict = "buy" | "no_buy";

export type CommitteeMember = {
  id: string;
  name: string;
  initial: string;
};

export type Vote = {
  memberId: string;
  verdict: Verdict;
  rationale: string;
};

export type Asset = {
  id: string;
  ticker: string;
  name: string;
  price: number;
  changePct: number;
  volumeToday: number;
  sparkline: number[];
  votes: Vote[];
};

export const committeeMembers: CommitteeMember[] = [
  { id: "m1", name: "Kang", initial: "K" },
  { id: "m2", name: "Lee", initial: "L" },
  { id: "m3", name: "Park", initial: "P" },
  { id: "m4", name: "Sofia", initial: "S" },
  { id: "m5", name: "Devon", initial: "D" },
];

const spark = (base: number, points: number, drift: number) =>
  Array.from({ length: points }, (_, i) =>
    Math.max(1, base + Math.sin(i / 2) * drift + i * (drift / points)),
  );

export const assets: Asset[] = [
  {
    id: "a1",
    ticker: "NVDA",
    name: "NVIDIA Corp.",
    price: 187.42,
    changePct: 3.8,
    volumeToday: 142580,
    sparkline: spark(60, 24, 8),
    votes: [
      { memberId: "m1", verdict: "buy", rationale: "AI 인프라 수요가 여전히 공급을 초과." },
      { memberId: "m2", verdict: "buy", rationale: "데이터센터 매출 가이던스 상향." },
      { memberId: "m3", verdict: "buy", rationale: "경쟁사 대비 마진 방어력 우수." },
      { memberId: "m4", verdict: "no_buy", rationale: "밸류에이션이 이미 낙관을 반영." },
      { memberId: "m5", verdict: "buy", rationale: "차세대 칩 로드맵 리스크 낮음." },
    ],
  },
  {
    id: "a2",
    ticker: "TSLA",
    name: "Tesla, Inc.",
    price: 241.15,
    changePct: -1.6,
    volumeToday: 98230,
    sparkline: spark(55, 24, -5),
    votes: [
      { memberId: "m1", verdict: "no_buy", rationale: "인도량 성장 둔화 지속." },
      { memberId: "m2", verdict: "no_buy", rationale: "가격 인하가 마진을 압박." },
      { memberId: "m3", verdict: "buy", rationale: "에너지 사업부 가치가 저평가." },
      { memberId: "m4", verdict: "no_buy", rationale: "단기 모멘텀 부재." },
      { memberId: "m5", verdict: "no_buy", rationale: "규제 리스크 상존." },
    ],
  },
  {
    id: "a3",
    ticker: "MSFT",
    name: "Microsoft Corp.",
    price: 452.09,
    changePct: 1.2,
    volumeToday: 61340,
    sparkline: spark(70, 24, 3),
    votes: [
      { memberId: "m1", verdict: "buy", rationale: "Azure 성장률이 예상치 상회." },
      { memberId: "m2", verdict: "buy", rationale: "Copilot 유료 전환율 개선." },
      { memberId: "m3", verdict: "buy", rationale: "현금흐름 안정성 최상위." },
      { memberId: "m4", verdict: "buy", rationale: "다각화된 매출 구조가 방어적." },
      { memberId: "m5", verdict: "no_buy", rationale: "단기 밸류에이션 부담." },
    ],
  },
  {
    id: "a4",
    ticker: "COIN",
    name: "Coinbase Global",
    price: 198.77,
    changePct: 6.4,
    volumeToday: 75210,
    sparkline: spark(40, 24, 12),
    votes: [
      { memberId: "m1", verdict: "buy", rationale: "거래대금 회복 초입 국면." },
      { memberId: "m2", verdict: "no_buy", rationale: "규제 불확실성 여전히 큼." },
      { memberId: "m3", verdict: "no_buy", rationale: "변동성 대비 리스크 보상 낮음." },
      { memberId: "m4", verdict: "buy", rationale: "수수료 외 매출 다각화 진행 중." },
      { memberId: "m5", verdict: "no_buy", rationale: "매크로 민감도 과도." },
    ],
  },
];

export type AlertItem = {
  id: string;
  type: "activity" | "sentiment";
  assetTicker: string;
  title: string;
  detail: string;
  minutesAgo: number;
  severity: "high" | "medium";
};

export const alerts: AlertItem[] = [
  {
    id: "al1",
    type: "activity",
    assetTicker: "COIN",
    title: "평균 대비 거래량 +180%",
    detail: "최근 15분 거래량이 20일 평균 대비 급증했습니다.",
    minutesAgo: 4,
    severity: "high",
  },
  {
    id: "al2",
    type: "sentiment",
    assetTicker: "TSLA",
    title: "위원회 의견 2표 이동",
    detail: "Park 위원이 비매수에서 매수로 판정을 변경했습니다.",
    minutesAgo: 12,
    severity: "medium",
  },
];

export const portfolio = {
  totalValue: 84210.55,
  todayChangePct: 2.1,
  holdings: [
    { assetId: "a1", quantity: 40 },
    { assetId: "a3", quantity: 22 },
    { assetId: "a2", quantity: 15 },
  ],
};

export function consensus(votes: Vote[]): {
  buy: number;
  noBuy: number;
  verdict: "buy" | "no_buy" | "split";
} {
  const buy = votes.filter((v) => v.verdict === "buy").length;
  const noBuy = votes.length - buy;
  const verdict = buy > noBuy ? "buy" : noBuy > buy ? "no_buy" : "split";
  return { buy, noBuy, verdict };
}
