import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("Footer");
  const tCommon = useTranslations("Common");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border-subtle">
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-foreground-muted">
        <p>
          {tCommon("brand")} — {t("tagline")}
        </p>
        <p>
          © {year} {tCommon("brand")}. {t("rights")}
        </p>
      </div>
    </footer>
  );
}
