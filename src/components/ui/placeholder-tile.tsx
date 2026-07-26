import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";

// Used to fill out the bento grid's shape in empty states, so the layout
// looks intentional even before there's real content to show.
export function PlaceholderTile({
  icon: Icon,
  label,
  className,
}: {
  icon: LucideIcon;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center gap-2 rounded-[20px] border border-dashed border-border-subtle p-4 text-center text-foreground-muted",
        className,
      )}
    >
      <Icon size={18} strokeWidth={1.5} />
      <span className="text-xs">{label}</span>
    </div>
  );
}
