"use client";

import type { ReactNode } from "react";
import { ResponsiveContainer } from "recharts";
import { SectionHeader } from "./section-header";

// Generic chart container: any recharts element (or custom SVG) can be
// dropped in as children, so this is reused for radar charts, gauges, and
// future line/candlestick charts without duplicating layout/border code.
export function ChartPanel({
  eyebrow,
  meta,
  height = 190,
  bordered = false,
  children,
  className = "",
}: {
  eyebrow?: ReactNode;
  meta?: ReactNode;
  height?: number;
  bordered?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${bordered ? "term-panel rounded-lg" : ""} ${className}`}>
      {eyebrow != null && <SectionHeader eyebrow={eyebrow} meta={meta} bordered={bordered} />}
      <div style={{ height }} className={bordered ? "p-4 pt-2" : ""}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
