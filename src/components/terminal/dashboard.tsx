import { AppShell } from "./ui/app-shell";
import { Panel } from "./ui/panel";
import { CapitalFlowVisualization } from "./ui/capital-flow-visualization";
import { CommandSidebar } from "./command-sidebar";
import { CommandHeader } from "./command-header";
import { MarketOverviewSection } from "./sections/market-overview-section";
import { MarketRegimeSection } from "./sections/market-regime-section";
import { InvestmentCommitteeSection } from "./sections/investment-committee-section";
import { OpportunityRadarSection } from "./sections/opportunity-radar-section";
import { IntelligenceFeedSection } from "./sections/intelligence-feed-section";
import { PortfolioPulseSection } from "./sections/portfolio-pulse-section";
import { MarketMoversSection } from "./sections/market-movers-section";
import { capitalFlowNodes, capitalFlowLinks } from "@/lib/terminal/mock-data";

export function Dashboard() {
  return (
    <AppShell sidebar={<CommandSidebar />} header={<CommandHeader />}>
      <MarketOverviewSection />

      {/* MAIN BENTO — two independent columns so panel heights follow their
          own content instead of forcing every row to match. Investment
          Committee dominates the left column; Market Regime, Opportunity
          Radar, and Portfolio Pulse stack down the right. */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        <div className="xl:col-span-7 flex flex-col gap-4">
          <div id="section-committee">
            <InvestmentCommitteeSection />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div id="section-flow">
              {/* No real regional capital-flow data source exists (would need
                  a dedicated flows provider) — kept illustrative, labeled as such. */}
              <Panel eyebrow="Capital Flow" meta="Global · Illustrative" noPadding>
                <CapitalFlowVisualization
                  nodes={capitalFlowNodes}
                  links={capitalFlowLinks}
                  height={400}
                  legend={[
                    { label: "Strong Inflow", color: "var(--term-buy)" },
                    { label: "Inflow", color: "var(--term-cyan)" },
                    { label: "Outflow", color: "var(--term-nobuy)" },
                    { label: "Strong Outflow", color: "#c23b30" },
                  ]}
                />
              </Panel>
            </div>

            <div id="section-intelligence">
              <IntelligenceFeedSection />
            </div>
          </div>
        </div>

        <div className="xl:col-span-5 flex flex-col gap-4">
          <div id="section-regime">
            <MarketRegimeSection />
          </div>

          <div id="section-assets">
            <OpportunityRadarSection />
          </div>

          <div id="section-portfolio">
            <PortfolioPulseSection />
          </div>
        </div>
      </div>

      <MarketMoversSection />
    </AppShell>
  );
}
