import { getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/ui/glass-card";
import { committeeMembers } from "@/lib/committee/members";
import { getMarketingStats } from "@/lib/marketing-stats";

export async function CommitteeSection() {
  const t = await getTranslations("CommitteeIntro");
  const stats = await getMarketingStats();

  return (
    <section id="committee" className="mx-auto max-w-5xl px-4 md:px-6 py-16 md:py-24">
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
          {t("title")}
        </h2>
        <p className="mt-3 text-foreground-muted">{t("subtitle")}</p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {committeeMembers.map((member) => {
          const acc = stats.memberAccuracy.find((m) => m.memberId === member.id);
          const pct = acc && acc.total > 0 ? Math.round((acc.correct / acc.total) * 100) : null;

          return (
            <GlassCard
              key={member.id}
              className="flex flex-col items-center gap-2 text-center"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-medium">
                {member.initial}
              </div>
              <p className="font-medium">{member.name}</p>
              <p className="text-xs text-foreground-muted">
                {t(`members.${member.id}`)}
              </p>
              <p className="mt-1 text-sm tabular-nums">
                {pct != null ? (
                  <>
                    <span className="font-semibold text-buy">{pct}%</span>{" "}
                    <span className="text-foreground-muted">{t("accuracyLabel")}</span>
                  </>
                ) : (
                  <span className="text-foreground-muted">{t("noTrackYet")}</span>
                )}
              </p>
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
}
