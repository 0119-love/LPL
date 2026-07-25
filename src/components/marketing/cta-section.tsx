import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function CTASection() {
  const t = useTranslations("CTA");

  return (
    <section className="mx-auto max-w-3xl px-4 md:px-6 pb-20 md:pb-28 text-center">
      <div className="glass-card-strong rounded-3xl px-6 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
          {t("title")}
        </h2>
        <p className="mt-3 text-foreground-muted">{t("subtitle")}</p>
        <Link
          href="/dashboard"
          className="mt-7 inline-block rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background hover:opacity-90 transition-opacity"
        >
          {t("button")}
        </Link>
      </div>
    </section>
  );
}
