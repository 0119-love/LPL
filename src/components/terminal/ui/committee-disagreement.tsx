"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis } from "recharts";
import { ChartPanel } from "./chart-panel";

export function CommitteeDisagreement({
  dimensions,
  title = "Signal Spread",
  height = 190,
}: {
  dimensions: { dimension: string; value: number }[];
  title?: string;
  height?: number;
}) {
  return (
    <ChartPanel eyebrow={title} height={height}>
      <RadarChart data={dimensions} outerRadius="72%">
        <PolarGrid stroke="var(--term-border)" />
        <PolarAngleAxis dataKey="dimension" tick={{ fill: "var(--term-text-dim)", fontSize: 10 }} />
        <Radar dataKey="value" stroke="var(--term-cyan)" fill="var(--term-cyan)" fillOpacity={0.22} strokeWidth={1.5} />
      </RadarChart>
    </ChartPanel>
  );
}
