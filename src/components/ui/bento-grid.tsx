import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

// Shared asymmetric "bento" grid: a dense-packed CSS grid where tiles
// declare their own span (see bentoSpan below), so a big featured tile and
// several small supporting tiles interlock instead of forming a uniform grid.
export function BentoGrid({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "grid grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(96px,auto)] gap-4 grid-flow-row-dense",
        className,
      )}
      {...props}
    />
  );
}

export type BentoSize = "hero" | "wide" | "tall" | "small" | "full";

export function bentoSpan(size: BentoSize): string {
  switch (size) {
    case "hero":
      return "col-span-2 row-span-2";
    case "wide":
      return "col-span-2 row-span-1";
    case "tall":
      return "col-span-1 row-span-2";
    case "full":
      return "col-span-2 lg:col-span-4 row-span-1";
    case "small":
    default:
      return "col-span-1 row-span-1";
  }
}
