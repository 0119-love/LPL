import { getTranslations, setRequestLocale } from "next-intl/server";
import { GlassCard } from "@/components/ui/glass-card";
import { login, signup } from "./actions";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  const { error } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Auth");

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <GlassCard strong className="w-full max-w-sm">
        <h1 className="text-lg font-semibold">{t("title")}</h1>
        <p className="mt-1 text-sm text-foreground-muted">{t("subtitle")}</p>

        {error && (
          <p className="mt-4 rounded-lg bg-nobuy-soft px-3 py-2 text-sm text-nobuy">
            {error}
          </p>
        )}

        <form className="mt-6 flex flex-col gap-3">
          <input type="hidden" name="locale" value={locale} />

          <label className="flex flex-col gap-1.5 text-sm">
            {t("emailLabel")}
            <input
              type="email"
              name="email"
              required
              className="rounded-lg border border-border-subtle bg-background px-3 py-2 text-sm outline-none transition-shadow focus:border-foreground-muted focus:ring-1 focus:ring-white/10"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            {t("passwordLabel")}
            <input
              type="password"
              name="password"
              required
              minLength={6}
              className="rounded-lg border border-border-subtle bg-background px-3 py-2 text-sm outline-none transition-shadow focus:border-foreground-muted focus:ring-1 focus:ring-white/10"
            />
          </label>

          <div className="mt-2 flex gap-2">
            <button
              formAction={login}
              className="flex-1 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition-opacity"
            >
              {t("loginButton")}
            </button>
            <button
              formAction={signup}
              className="flex-1 rounded-full border border-border-subtle px-4 py-2 text-sm font-medium hover:bg-white/5 transition-colors"
            >
              {t("signupButton")}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
