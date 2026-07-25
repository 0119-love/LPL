"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const PALETTE = ["#3ddc84", "#4c9aff", "#ff8a4c", "#c792ea", "#ffd166", "#5eead4", "#f472b6"];

export type AllocationSlice = {
  ticker: string;
  value: number;
};

export function AllocationDonut({ data }: { data: AllocationSlice[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

  return (
    <div className="flex items-center gap-4">
      <div className="h-[160px] w-[160px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="ticker"
              innerRadius={48}
              outerRadius={72}
              paddingAngle={2}
              isAnimationActive={false}
            >
              {data.map((entry, i) => (
                <Cell key={entry.ticker} fill={PALETTE[i % PALETTE.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0];
                const pct = (((p.value as number) / total) * 100).toFixed(1);
                return (
                  <div className="glass-card-strong rounded-lg px-3 py-2 text-xs">
                    {p.name} — {pct}%
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        {data.map((d, i) => (
          <div key={d.ticker} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: PALETTE[i % PALETTE.length] }}
              />
              {d.ticker}
            </span>
            <span className="text-foreground-muted tabular-nums">
              {((d.value / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
