import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { HeroDashboardFrame } from "./hero-dashboard-frame";

export function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] opacity-40"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, var(--accent-buy-soft), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-4xl px-4 md:px-6 pt-16 md:pt-24 pb-12 text-center">
        <span className="inline-block rounded-full border border-border-subtle px-3 py-1 text-xs text-foreground-muted">
          {t("eyebrow")}
        </span>

        <h1 className="mt-5 whitespace-pre-line text-3xl md:text-5xl font-semibold tracking-tight">
          {t("title")}
        </h1>

        <p className="mt-5 text-balance text-base md:text-lg text-foreground-muted max-w-2xl mx-auto">
          {t("subtitle")}
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90 transition-opacity"
          >
            {t("ctaPrimary")}
          </Link>
          <a
            href="#features"
            className="rounded-full border border-border-subtle px-5 py-2.5 text-sm font-medium text-foreground hover:bg-white/5 transition-colors"
          >
            {t("ctaSecondary")}
          </a>
        </div>
      </div>

      <div className="relative px-4 md:px-6 pb-16 md:pb-24">
        <HeroDashboardFrame />
      </div>
    </section>
  );
}
