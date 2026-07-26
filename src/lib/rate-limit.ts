// Best-effort in-memory sliding window. Resets on cold start and isn't
// shared across concurrent serverless instances, but it's enough to blunt
// casual abuse hammering the shared Finnhub free-tier key (60 req/min total).
const WINDOW_MS = 10_000;
const MAX_REQUESTS = 20;

const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (bucket.count >= MAX_REQUESTS) {
    return false;
  }

  bucket.count += 1;
  return true;
}

export function clientKeyFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}

// Per-route budget, not just per-client — otherwise one endpoint's polling
// (e.g. quote refetches) can starve an unrelated one (e.g. search) sharing
// the same IP bucket.
export function clientKeyFromRequest(request: { headers: Headers; nextUrl: { pathname: string } }): string {
  return `${clientKeyFromHeaders(request.headers)}:${request.nextUrl.pathname}`;
}
