export type Verdict = "buy" | "no_buy";

export type CommitteeMember = {
  id: string;
  name: string;
  initial: string;
};

export type VoteHistoryPoint = {
  verdict: Verdict;
  daysAgo: number;
};

export type Vote = {
  memberId: string;
  verdict: Verdict;
  rationale: string;
  detail: string;
  relatedMetric: string;
  history: VoteHistoryPoint[]; // chronological is not required; daysAgo: 0 is the current stance
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

function vote(
  memberId: string,
  verdict: Verdict,
  rationale: string,
  detail: string,
  relatedMetric: string,
  priorHistory: VoteHistoryPoint[] = [{ verdict, daysAgo: 21 }],
): Vote {
  return {
    memberId,
    verdict,
    rationale,
    detail,
    relatedMetric,
    history: [...priorHistory, { verdict, daysAgo: 0 }],
  };
}

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
      vote(
        "m1",
        "buy",
        "AI 인프라 수요가 여전히 공급을 초과.",
        "하이퍼스케일러들의 2026년 설비투자 가이던스가 재차 상향되면서, 데이터센터향 GPU 수주 잔고가 4개 분기 연속 확대되고 있습니다. 공급 병목이 단기간에 해소되기 어려워 가격 결정력도 유지될 전망입니다.",
        "데이터센터 매출 YoY +94%",
      ),
      vote(
        "m2",
        "buy",
        "데이터센터 매출 가이던스 상향.",
        "최근 실적 발표에서 다음 분기 데이터센터 매출 가이던스를 컨센서스 대비 8% 상향했습니다. 신규 아키텍처 전환 수요가 예상보다 빠르게 반영되는 중입니다.",
        "매출 가이던스 컨센서스 +8%",
      ),
      vote(
        "m3",
        "buy",
        "경쟁사 대비 마진 방어력 우수.",
        "경쟁 칩셋 업체들의 가격 인하 압박에도 불구하고 매출총이익률이 70%대를 유지하고 있어, 소프트웨어/생태계 락인 효과가 실질적인 해자로 작동하고 있다고 판단합니다.",
        "매출총이익률 73.2%",
      ),
      vote(
        "m4",
        "no_buy",
        "밸류에이션이 이미 낙관을 반영.",
        "현재 주가는 향후 2년치 성장을 상당 부분 선반영하고 있습니다. 단기 조정 국면에서 진입하는 편이 리스크 대비 보상 측면에서 유리하다고 봅니다.",
        "선행 PER 업종 평균 대비 +40%",
        [
          { verdict: "no_buy", daysAgo: 21 },
          { verdict: "buy", daysAgo: 14 },
          { verdict: "no_buy", daysAgo: 6 },
        ],
      ),
      vote(
        "m5",
        "buy",
        "차세대 칩 로드맵 리스크 낮음.",
        "차세대 아키텍처 양산 일정이 계획대로 진행 중이며, 주요 고객사향 초도 물량 배정도 예정대로 이뤄지고 있어 로드맵 지연 리스크는 제한적입니다.",
        "차세대 칩 양산 일정 온스케줄",
      ),
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
      vote(
        "m1",
        "no_buy",
        "인도량 성장 둔화 지속.",
        "주요 시장에서의 인도량 증가율이 3개 분기 연속 둔화되고 있습니다. 신모델 출시 전까지는 뚜렷한 반등 모멘텀을 찾기 어렵다고 판단합니다.",
        "분기 인도량 YoY +2% (전분기 +11%)",
      ),
      vote(
        "m2",
        "no_buy",
        "가격 인하가 마진을 압박.",
        "경쟁 심화에 대응한 가격 인하 정책이 지속되며 차량 부문 매출총이익률이 압박받고 있습니다. 마진 방어를 위한 원가 절감 효과가 아직 상쇄하지 못하는 국면입니다.",
        "차량 부문 매출총이익률 -3.1%p",
      ),
      vote(
        "m3",
        "buy",
        "에너지 사업부 가치가 저평가.",
        "에너지 저장/발전 사업부의 성장률이 본업인 차량 부문을 상회하고 있음에도 시장이 이를 충분히 반영하지 못하고 있다고 판단합니다. 최근 비매수에서 매수로 판정을 변경했습니다.",
        "에너지 부문 매출 YoY +67%",
        [
          { verdict: "no_buy", daysAgo: 21 },
          { verdict: "no_buy", daysAgo: 7 },
          { verdict: "buy", daysAgo: 3 },
        ],
      ),
      vote(
        "m4",
        "no_buy",
        "단기 모멘텀 부재.",
        "신차 사이클 공백기에 진입하면서 뚜렷한 촉매 없이 횡보할 가능성이 높습니다. 다음 제품 발표 전까지는 관망을 유지합니다.",
        "다음 제품 사이클까지 촉매 부재",
      ),
      vote(
        "m5",
        "no_buy",
        "규제 리스크 상존.",
        "자율주행 관련 규제 심사가 예상보다 지연되고 있어, 해당 기술을 반영한 밸류에이션 프리미엄을 정당화하기 이르다고 봅니다.",
        "자율주행 규제 승인 지연",
      ),
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
      vote(
        "m1",
        "buy",
        "Azure 성장률이 예상치 상회.",
        "Azure 매출 성장률이 컨센서스를 3개 분기 연속 상회하며, AI 워크로드 전환이 클라우드 매출 믹스 개선으로 이어지고 있습니다.",
        "Azure 매출 성장률 +34% YoY",
      ),
      vote(
        "m2",
        "buy",
        "Copilot 유료 전환율 개선.",
        "기업용 Copilot 시트 기반 유료 전환율이 분기마다 개선되고 있어, 기존 오피스 라이선스 대비 ARPU 상승 여력이 충분합니다.",
        "Copilot 유료 전환율 +5%p QoQ",
      ),
      vote(
        "m3",
        "buy",
        "현금흐름 안정성 최상위.",
        "잉여현금흐름이 매출 성장과 함께 안정적으로 확대되고 있어, 대규모 설비투자 이후에도 배당·자사주매입 여력이 충분합니다.",
        "잉여현금흐름 마진 28%",
      ),
      vote(
        "m4",
        "buy",
        "다각화된 매출 구조가 방어적.",
        "클라우드, 생산성 소프트웨어, 게임 등 다각화된 매출 구조 덕분에 특정 사업부 둔화에도 전사 실적 변동성이 낮게 유지됩니다.",
        "사업부별 매출 비중 균형 지수 양호",
      ),
      vote(
        "m5",
        "no_buy",
        "단기 밸류에이션 부담.",
        "펀더멘털은 견조하나 최근 랠리로 단기 밸류에이션 부담이 커진 상태입니다. 조정 시 재진입을 고려합니다.",
        "선행 PER 12개월 평균 대비 +18%",
        [
          { verdict: "buy", daysAgo: 21 },
          { verdict: "no_buy", daysAgo: 9 },
        ],
      ),
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
      vote(
        "m1",
        "buy",
        "거래대금 회복 초입 국면.",
        "온체인 거래대금이 저점 대비 반등하기 시작했고, 신규 계좌 개설 수도 함께 증가하고 있어 거래 수수료 매출 회복 초입으로 판단합니다.",
        "일평균 거래대금 저점 대비 +42%",
      ),
      vote(
        "m2",
        "no_buy",
        "규제 불확실성 여전히 큼.",
        "핵심 시장에서의 규제 프레임워크가 아직 확정되지 않아, 사업 모델 자체에 대한 불확실성 프리미엄이 유지되고 있습니다.",
        "규제 프레임워크 확정 지연",
      ),
      vote(
        "m3",
        "no_buy",
        "변동성 대비 리스크 보상 낮음.",
        "베타가 높아 시장 변동성에 과도하게 노출되어 있는 반면, 현재 밸류에이션에서 기대할 수 있는 초과 수익은 제한적이라고 판단합니다.",
        "베타 2.1",
      ),
      vote(
        "m4",
        "buy",
        "수수료 외 매출 다각화 진행 중.",
        "구독·서비스 매출 비중이 꾸준히 확대되며 거래 수수료 의존도가 낮아지고 있어, 시장 변동성에 대한 실적 민감도가 점차 완화되는 추세입니다.",
        "구독·서비스 매출 비중 +6%p YoY",
      ),
      vote(
        "m5",
        "no_buy",
        "매크로 민감도 과도.",
        "금리·유동성 환경 변화에 대한 주가 민감도가 과도하게 높아, 매크로 리스크 관리 관점에서 비중 확대에 신중해야 한다고 봅니다.",
        "매크로 베타 상위 10% 구간",
      ),
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
