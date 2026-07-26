"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import { useUser } from "@/lib/supabase/use-user";
import { createClient } from "@/lib/supabase/client";
import { Link, useRouter } from "@/i18n/navigation";

export function CommandUserMenu() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayName = user?.email?.split("@")[0] ?? "Investor";
  const capitalized = displayName.charAt(0).toUpperCase() + displayName.slice(1);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  async function handleLogout() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (!loading && !user) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-2 rounded-md border border-[var(--term-border)] bg-white/[0.03] py-1 pl-1 pr-2.5 text-[12px] font-medium hover:bg-white/[0.05] transition-colors"
      >
        <div className="grid h-6 w-6 shrink-0 place-items-center rounded bg-white/[0.06] text-[var(--term-text-dim)]">
          <UserIcon size={12} strokeWidth={2} />
        </div>
        <span className="hidden sm:inline">Log in</span>
      </Link>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md border border-[var(--term-border)] bg-white/[0.03] py-1 pl-1 pr-2 hover:bg-white/[0.05] transition-colors"
      >
        <div className="grid h-6 w-6 shrink-0 place-items-center rounded bg-[var(--term-buy)]/15 text-[11px] font-medium text-[var(--term-buy)]">
          {capitalized[0]}
        </div>
        <span className="hidden sm:flex flex-col items-start leading-none">
          <span className="text-[12px] font-medium">{capitalized}</span>
          <span className="mt-0.5 text-[9.5px] text-[var(--term-text-dim)]">Pro Plan</span>
        </span>
        <ChevronDown size={13} strokeWidth={2} className="hidden sm:block text-[var(--term-text-dim)]" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1.5 w-56 overflow-hidden rounded-lg border border-[var(--term-border)] bg-[var(--term-panel-elevated)] shadow-xl">
          <div className="px-3 py-2.5 border-b border-[var(--term-border)]">
            <p className="text-[12px] font-medium truncate">{user?.email}</p>
            <p className="text-[10.5px] text-[var(--term-text-dim)]">Pro Plan</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={signingOut}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12.5px] text-[var(--term-text)] hover:bg-white/[0.05] transition-colors disabled:opacity-60"
          >
            <LogOut size={14} strokeWidth={1.75} />
            {signingOut ? "Logging out…" : "Log out"}
          </button>
        </div>
      )}
    </div>
  );
}
