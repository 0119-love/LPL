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
