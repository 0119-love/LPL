"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/lib/supabase/use-user";
import { Header } from "./ui/header";
import { StatusIndicator } from "./ui/status-indicator";
import { CommandSearch } from "./command-search";
import { CommandNotifications } from "./command-notifications";
import { CommandUserMenu } from "./command-user-menu";

function greetingFor(hour: number) {
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

export function CommandHeader() {
  const { user } = useUser();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const displayName = user?.email?.split("@")[0] ?? "Investor";
  const capitalized = displayName.charAt(0).toUpperCase() + displayName.slice(1);

  return (
    <Header
      title={`${greetingFor(now?.getHours() ?? 9)}, ${capitalized}`}
      subtitle={
        now
          ? now.toLocaleString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          : " "
      }
      center={<CommandSearch />}
      actions={
        <>
          <StatusIndicator label="LIVE" tone="buy" pulse pill className="hidden sm:inline-flex" />
          <CommandNotifications />
          <CommandUserMenu />
        </>
      }
    />
  );
}
