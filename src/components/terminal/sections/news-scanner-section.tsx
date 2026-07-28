"use client";

import { Panel } from "../ui/panel";
import { useCompanyNews } from "@/lib/queries/terminal-queries";

const SPOTLIGHT_TICKER = "NVDA";

function timeAgo(unixSeconds: number) {
  const minutes = Math.max(0, Math.round((Date.now() - unixSeconds * 1000) / 60_000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function NewsScannerSection() {
  const { data: news, isPending, isError } = useCompanyNews(SPOTLIGHT_TICKER);
  const items = (news ?? []).filter((n) => n.headline).slice(0, 6);

  return (
    <Panel
      id="section-news"
      eyebrow="News Scanner"
      meta={isPending ? "Loading…" : `${SPOTLIGHT_TICKER} · Live`}
      noPadding
    >
      {isError && (
        <p className="px-4 py-4 text-[12px] text-[var(--term-text-dim)]">News feed unavailable right now.</p>
      )}
      {!isError && !isPending && items.length === 0 && (
        <p className="px-4 py-4 text-[12px] text-[var(--term-text-dim)]">No recent news found.</p>
      )}
      <div className="divide-y divide-[var(--term-border)]">
        {items.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-3 hover:bg-white/[0.03] transition-colors"
          >
            <div className="flex items-center gap-2 text-[10.5px] text-[var(--term-text-dim)]">
              <span className="font-medium text-[var(--term-text-mid)]">{item.source}</span>
              <span>·</span>
              <span className="term-mono">{timeAgo(item.datetime)}</span>
            </div>
            <p className="mt-1 text-[12.5px] leading-snug text-[var(--term-text)]">{item.headline}</p>
          </a>
        ))}
      </div>
    </Panel>
  );
}
