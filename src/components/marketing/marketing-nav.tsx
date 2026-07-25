import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./locale-switcher";

export function MarketingNav() {
  const t = useTranslations("Nav");
  const tCommon = useTranslations("Common");

  return (
    <header className="sticky top-0 z-30 border-b border-border-subtle bg-background/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 md:px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-foreground text-background grid place-items-center text-[11px] font-bold">
            V
          </div>
          <span className="text-sm font-semibold">{tCommon("brand")}</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-foreground-muted">
          <a href="#features" className="hover:text-foreground">
            {t("features")}
          </a>
          <a href="#committee" className="hover:text-foreground">
            {t("committee")}
          </a>
        </div>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <Link
            href="/login"
            className="hidden sm:inline text-sm text-foreground-muted hover:text-foreground"
          >
            {t("login")}
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background hover:opacity-90 transition-opacity"
          >
            {t("getStarted")}
          </Link>
        </div>
      </nav>
    </header>
  );
}
