import { AppShell } from "./ui/app-shell";
import { Panel } from "./ui/panel";
import { Metric } from "./ui/metric";
import { Sparkline } from "./ui/sparkline";
import { Gauge } from "./ui/gauge";
import { StatusIndicator } from "./ui/status-indicator";
import { VerdictPanel } from "./ui/verdict-panel";
import { OpportunityRow } from "./ui/opportunity-row";
import { IntelligenceEvent } from "./ui/intelligence-event";
import { CapitalFlowVisualization } from "./ui/capital-flow-visualization";
import { toneForChange } from "./ui/tone";
import { CommandSidebar } from "./command-sidebar";
import { CommandHeader } from "./command-header";
import { committeeMembers } from "@/lib/committee/members";
import {
  marketIndices,
  marketRegime,
  committeeAnalysts,
  committeeVerdict,
  radarDimensions,
  opportunities,
  capitalFlowNodes,
  capitalFlowLinks,
  intelligenceFeed,
  portfolioPulse,
  marketMovers,
} from "@/lib/terminal/mock-data";

const committeeMemberData = committeeAnalysts.map((analyst) => {
  const member = committeeMembers.find((m) => m.name === analyst.name);
  return {
    id: analyst.id,
    initial: member?.initial ?? analyst.name[0],
    name: analyst.name,
    role: analyst.role,
    verdict: analyst.verdict,
    score: analyst.score,
  };
});

export function Dashboard() {
  return (
    <AppShell sidebar={<CommandSidebar />} header={<CommandHeader />}>
      {/* Market Overview — thin context strip: raw ticker data, not a
          ranked insight, so it stays visually quiet. */}
      <Panel id="section-markets" eyebrow="Market Overview" meta="Updated just now" noPadding>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5">
          {marketIndices.map((idx) => {
            const tone = toneForChange(idx.changePct);
            const positive = idx.changePct >= 0;
            return (
              <div
                key={idx.symbol}
                className="flex items-end justify-between gap-2 border-b border-r border-[var(--term-border)] px-4 py-3 last:border-r-0 sm:[&:nth-child(3n)]:border-r-0 xl:[&:nth-child(3n)]:border-r xl:[&:nth-child(5n)]:border-r-0"
              >
                <Metric
                  label={idx.symbol}
                  value={idx.value}
                  sublabel={`${positive ? "+" : ""}${idx.changePct.toFixed(2)}%`}
                  tone={tone}
                  size="sm"
                />
                <Sparkline data={idx.spark} positive={positive} width={48} height={24} />
              </div>
            );
          })}
        </div>
      </Panel>

      {/* MAIN BENTO — two independent columns so panel heights follow their
          own content instead of forcing every row to match. Investment
          Committee dominates the left column; Market Regime, Opportunity
          Radar, and Portfolio Pulse stack down the right. */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        <div className="xl:col-span-7 flex flex-col gap-4">
          <div id="section-committee">
            <VerdictPanel
              eyebrow="Investment Committee"
              meta={<StatusIndicator label="Live Analysis" tone="buy" pulse size="xs" />}
              consensus={{
                verdictLabel: committeeVerdict.label,
                score: committeeVerdict.score,
                agree: committeeVerdict.agree,
                total: committeeVerdict.total,
                confidence: committeeVerdict.confidence,
              }}
              disagreement={{ dimensions: radarDimensions }}
              members={committeeMemberData}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div id="section-flow">
              <Panel eyebrow="Capital Flow" meta="Global · 24H" noPadding>
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
              <Panel
                eyebrow="Intelligence Feed"
                meta={
                  <a href="#" className="text-[var(--term-text-dim)] hover:text-[var(--term-text)]">
                    View all
                  </a>
                }
                noPadding
              >
                <div className="divide-y divide-[var(--term-border)]">
                  {intelligenceFeed.map((event) => (
                    <IntelligenceEvent key={event.id} {...event} />
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        </div>

        <div className="xl:col-span-5 flex flex-col gap-4">
          <div id="section-regime">
            <Panel eyebrow="Market Regime" meta="Risk Appetite" bodyClassName="flex flex-col items-center">
              <Gauge
                value={marketRegime.score}
                max={marketRegime.maxScore}
                size={180}
                zones={[
                  { color: "var(--term-buy)", to: marketRegime.maxScore * 0.45 },
                  { color: "var(--term-amber)", to: marketRegime.maxScore * 0.75 },
                  { color: "var(--term-nobuy)", to: marketRegime.maxScore },
                ]}
                valueLabel={
                  <>
                    <p className="text-2xl font-bold tracking-tight text-[var(--term-buy)]">
                      {marketRegime.label}
                    </p>
                    <p className="term-mono mt-1 text-base font-semibold text-[var(--term-text)]">
                      {marketRegime.score}
                      <span className="text-[var(--term-text-dim)]">/{marketRegime.maxScore}</span>
                    </p>
                  </>
                }
                caption={marketRegime.caption}
              />

              <div className="mt-5 grid w-full grid-cols-2 gap-3 border-t border-[var(--term-border)] pt-4">
                {marketRegime.breakdown.map((stat) => (
                  <div key={stat.label}>
                    <p className="term-eyebrow">{stat.label}</p>
                    <p className="term-mono mt-1 text-[13px] font-semibold">
                      {stat.value} <span className="text-[11px] font-normal text-[var(--term-text-dim)]">{stat.note}</span>
                    </p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div id="section-assets">
            <Panel eyebrow="Opportunity Radar" meta={`Top ${opportunities.length}`} noPadding>
              <div className="divide-y divide-[var(--term-border)]">
                {opportunities.map((op) => (
                  <OpportunityRow key={op.ticker} {...op} />
                ))}
              </div>
            </Panel>
          </div>

          <div id="section-portfolio">
            <Panel eyebrow="Portfolio Pulse" meta="Today">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="term-eyebrow">Total Value</p>
                  <p className="term-mono mt-1 text-2xl font-bold">
                    ${portfolioPulse.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <p
                    className={`term-mono text-[12px] font-medium ${
                      toneForChange(portfolioPulse.changePct) === "buy" ? "text-[var(--term-buy)]" : "text-[var(--term-nobuy)]"
                    }`}
                  >
                    {portfolioPulse.changePct >= 0 ? "+" : ""}
                    {portfolioPulse.changePct.toFixed(2)}%
                  </p>
                </div>
                <Sparkline data={portfolioPulse.spark} positive={portfolioPulse.changePct >= 0} width={100} height={36} />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[var(--term-border)] pt-4">
                <Metric label="Risk Score" value={portfolioPulse.riskScore} unit={`/${portfolioPulse.riskMax}`} sublabel={portfolioPulse.riskLabel} tone="amber" />
                <Metric label="Sharpe Ratio" value={portfolioPulse.sharpeRatio.toFixed(2)} sublabel={portfolioPulse.sharpeLabel} tone="buy" />
                <Metric label="Max Drawdown" value={`${portfolioPulse.maxDrawdownPct.toFixed(2)}%`} sublabel={portfolioPulse.drawdownLabel} tone="nobuy" />
                <Metric label="Cash Position" value={`${portfolioPulse.cashPct.toFixed(1)}%`} sublabel={`$${portfolioPulse.cashPosition.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} />
              </div>
            </Panel>
          </div>
        </div>
      </div>

      {/* Bottom market ticker — compact, high-density strip. */}
      <div className="term-panel rounded-lg flex items-center gap-6 overflow-x-auto px-4 py-2.5 term-scrollbar">
        <span className="term-eyebrow shrink-0">Market Movers</span>
        {marketMovers.map((m) => {
          const positive = m.changePct >= 0;
          return (
            <span key={m.ticker} className="flex shrink-0 items-baseline gap-2 text-[12px]">
              <span className="font-semibold">{m.ticker}</span>
              <span className="term-mono text-[var(--term-text-mid)]">{m.price.toFixed(2)}</span>
              <span className={`term-mono font-medium ${positive ? "text-[var(--term-buy)]" : "text-[var(--term-nobuy)]"}`}>
                {positive ? "+" : ""}
                {m.changePct.toFixed(2)}%
              </span>
            </span>
          );
        })}
      </div>
    </AppShell>
  );
}
