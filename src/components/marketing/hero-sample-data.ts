// Static illustrative content for the landing page hero mockup only —
// intentionally decoupled from the real committee data model.
export const heroSample = {
  ticker: "NVDA",
  price: 187.42,
  changePct: 3.8,
  sparkline: [60, 62, 65, 63, 68, 70, 74, 71, 76, 80, 78, 83, 86, 84, 88, 91, 89, 93, 96, 94, 98, 101, 99, 104],
  votes: ["buy", "buy", "buy", "no_buy", "buy"] as const,
};
