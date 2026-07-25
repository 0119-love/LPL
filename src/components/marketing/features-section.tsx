import { useTranslations } from "next-intl";
import { Gavel, LineChart, Bell } from "lucide-react";
import { FeatureThumb } from "./feature-thumb";

const ICONS = [Gavel, LineChart, Bell];

export function FeaturesSection() {
  const t = useTranslations("Features");
  const items = t.raw("items") as { title: string; desc: string }[];

  return (
    <section id="features" className="mx-auto max-w-5xl px-4 md:px-6 py-16 md:py-24">
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
          {t("title")}
        </h2>
        <p className="mt-3 text-foreground-muted">{t("subtitle")}</p>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item, i) => (
          <FeatureThumb
            key={item.title}
            index={i}
            icon={ICONS[i % ICONS.length]}
            title={item.title}
            desc={item.desc}
          />
        ))}
      </div>
    </section>
  );
}
