export type FlowNode = {
  id: string;
  label: string;
  netFlow: number;
  x: number;
  y: number;
};

export type FlowLink = {
  from: string;
  to: string;
  strength: "strong" | "normal" | "outflow";
};

export type FlowLegendItem = {
  label: string;
  color: string;
};

const LINK_COLOR: Record<FlowLink["strength"], string> = {
  strong: "var(--term-buy)",
  normal: "var(--term-cyan)",
  outflow: "var(--term-nobuy)",
};

function nodeColor(netFlow: number) {
  if (netFlow >= 8) return "var(--term-buy)";
  if (netFlow >= 0) return "var(--term-cyan)";
  return "var(--term-nobuy)";
}

// Soft, low-opacity landmass hints — not a literal map, just enough visual
// weight behind the nodes to read as "world map" rather than empty space.
const LANDMASSES: { left: string; top: string; width: string; height: string }[] = [
  { left: "6%", top: "34%", width: "26%", height: "40%" },
  { left: "42%", top: "18%", width: "18%", height: "26%" },
  { left: "46%", top: "50%", width: "16%", height: "34%" },
  { left: "68%", top: "22%", width: "28%", height: "46%" },
];

export function CapitalFlowVisualization({
  nodes,
  links,
  legend,
  height = 220,
}: {
  nodes: FlowNode[];
  links: FlowLink[];
  legend?: FlowLegendItem[];
  height?: number;
}) {
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <div>
      <div className="relative w-full overflow-hidden bg-[var(--term-bg)]" style={{ height }}>
        {LANDMASSES.map((shape, i) => (
          <div
            key={i}
            className="absolute rounded-[40%] bg-white/[0.025]"
            style={{ left: shape.left, top: shape.top, width: shape.width, height: shape.height }}
          />
        ))}

        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0">
          {links.map((link, i) => {
            const a = byId[link.from];
            const b = byId[link.to];
            if (!a || !b) return null;
            const midX = (a.x + b.x) / 2;
            const midY = Math.min(a.y, b.y) - 14;
            return (
              <path
                key={i}
                d={`M ${a.x} ${a.y} Q ${midX} ${midY} ${b.x} ${b.y}`}
                fill="none"
                stroke={LINK_COLOR[link.strength]}
                strokeWidth={link.strength === "strong" ? 0.6 : 0.35}
                strokeOpacity={0.55}
                strokeDasharray={link.strength === "outflow" ? "1.5 1.5" : undefined}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>

        {nodes.map((node) => {
          const positive = node.netFlow >= 0;
          const color = nodeColor(node.netFlow);
          const size = 6 + Math.min(Math.abs(node.netFlow), 16) * 0.7;
          return (
            <div
              key={node.id}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <span
                className="rounded-full ring-2 ring-[var(--term-bg)]"
                style={{ width: size, height: size, background: color }}
              />
              <span className="term-mono mt-1.5 whitespace-nowrap text-[9.5px] font-medium text-[var(--term-text)]">
                {node.label}
              </span>
              <span
                className={`term-mono text-[9.5px] font-semibold ${positive ? "text-[var(--term-buy)]" : "text-[var(--term-nobuy)]"}`}
              >
                {positive ? "+" : ""}
                {node.netFlow.toFixed(1)}B
              </span>
            </div>
          );
        })}
      </div>

      {legend && legend.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-[var(--term-border)] px-4 py-2.5 text-[10.5px] text-[var(--term-text-dim)]">
          {legend.map((item) => (
            <span key={item.label} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
