const FINNHUB_BASE = "https://finnhub.io/api/v1";

function requireApiKey() {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) {
    throw new Error("FINNHUB_API_KEY is not set");
  }
  return key;
}

async function finnhubFetch<T>(
  path: string,
  params: Record<string, string>,
  revalidateSeconds = 15,
) {
  const url = new URL(`${FINNHUB_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set("token", requireApiKey());

  const res = await fetch(url, { next: { revalidate: revalidateSeconds } });
  if (!res.ok) {
    throw new Error(`Finnhub ${path} failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export type FinnhubSearchResult = {
  count: number;
  result: {
    description: string;
    displaySymbol: string;
    symbol: string;
    type: string;
  }[];
};

export function searchSymbol(query: string) {
  return finnhubFetch<FinnhubSearchResult>("/search", { q: query });
}

export type FinnhubQuote = {
  c: number; // current price
  d: number; // change
  dp: number; // percent change
  h: number; // high
  l: number; // low
  o: number; // open
  pc: number; // previous close
  t: number; // timestamp
};

export function getQuote(symbol: string) {
  return finnhubFetch<FinnhubQuote>("/quote", { symbol });
}

export type FinnhubProfile = {
  logo: string;
  name: string;
  ticker: string;
  weburl: string;
};

// Company logos don't change intraday, so this is cached far longer than quotes.
export function getProfile(symbol: string) {
  return finnhubFetch<FinnhubProfile>("/stock/profile2", { symbol }, 86_400);
}

export type FinnhubNewsItem = {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: number; // unix seconds
  related: string;
  image: string;
};

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function getCompanyNews(symbol: string) {
  const to = new Date();
  const from = new Date(to.getTime() - 14 * 24 * 60 * 60 * 1000);
  return finnhubFetch<FinnhubNewsItem[]>(
    "/company-news",
    { symbol, from: isoDate(from), to: isoDate(to) },
    300,
  );
}
