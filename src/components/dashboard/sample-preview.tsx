"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

// Wraps clearly-fake illustrative content with a dimmed overlay + login CTA,
// so signed-out tabs show what the feature looks like instead of an empty card.
export function SamplePreview({
  message,
  cta,
  children,
}: {
  message: string;
  cta: string;
  children: ReactNode;
}) {
  const tc = useTranslations("Common");

  return (
    <div className="relative">
      <div aria-hidden className="pointer-events-none select-none opacity-60 blur-[2px]">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="rounded-full border border-border-subtle bg-background-elevated/90 px-3 py-1 text-[11px] font-medium text-foreground-muted backdrop-blur">
          {tc("sampleBadge")}
        </span>
        <p className="max-w-xs text-sm text-foreground-muted">{message}</p>
        <Link
          href="/login"
          className="rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition-opacity hover:opacity-90"
        >
          {cta}
        </Link>
      </div>
    </div>
  );
}
