import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  strong?: boolean;
};

export function GlassCard({ className, strong, ...props }: Props) {
  return (
    <div
      className={clsx(
        "rounded-[20px] p-4",
        strong ? "glass-card-strong" : "glass-card",
        className,
      )}
      {...props}
    />
  );
}
