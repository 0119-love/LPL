export type CommitteeMember = {
  id: string;
  name: string;
  initial: string;
  style: string;
};

// Ids must stay in sync with the committee_members seed data (0001_init.sql).
// `style` doubles as the persona description fed into the verdict-generation
// prompt (see lib/committee/generate.ts).
export const committeeMembers: CommitteeMember[] = [
  {
    id: "m1",
    name: "Kang",
    initial: "K",
    style: "성장주/기술 트렌드 신봉자 — 매출 성장률과 시장 확장성을 최우선으로 본다",
  },
  {
    id: "m2",
    name: "Lee",
    initial: "L",
    style: "펀더멘털/현금흐름 중시 — 마진과 잉여현금흐름 안정성을 최우선으로 본다",
  },
  {
    id: "m3",
    name: "Park",
    initial: "P",
    style: "역발상 저평가 발굴형 — 시장이 놓친 숨은 가치를 찾는다",
  },
  {
    id: "m4",
    name: "Sofia",
    initial: "S",
    style: "밸류에이션 원칙주의자 — 현재 주가가 펀더멘털 대비 과도한지 엄격히 따진다",
  },
  {
    id: "m5",
    name: "Devon",
    initial: "D",
    style: "매크로/리스크 관리형 — 금리, 규제, 변동성 리스크를 최우선으로 본다",
  },
];
