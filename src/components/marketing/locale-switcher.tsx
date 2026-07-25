"use client";

import { clsx } from "clsx";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  return (
    <div className="flex items-center rounded-full border border-border-subtle p-0.5 text-xs">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() =>
            router.replace(
              // @ts-expect-error -- pathname is dynamic across routes
              { pathname, params },
              { locale: loc },
            )
          }
          className={clsx(
            "rounded-full px-2.5 py-1 uppercase transition-colors",
            loc === locale
              ? "bg-white/10 text-foreground"
              : "text-foreground-muted hover:text-foreground",
          )}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
