import { setRequestLocale } from "next-intl/server";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Hero } from "@/components/marketing/hero";
import { FeaturesSection } from "@/components/marketing/features-section";
import { CommitteeSection } from "@/components/marketing/committee-section";
import { CTASection } from "@/components/marketing/cta-section";
import { Footer } from "@/components/marketing/footer";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex flex-col flex-1">
      <MarketingNav />
      <main className="flex-1">
        <Hero />
        <FeaturesSection />
        <CommitteeSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
