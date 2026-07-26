import type { ReactNode } from "react";

export function AppShell({
  sidebar,
  header,
  children,
}: {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="command-terminal flex h-dvh w-full overflow-hidden">
      {sidebar}
      <div className="flex min-w-0 flex-1 flex-col">
        {header}
        <main className="term-scrollbar flex-1 overflow-y-auto px-4 md:px-6 py-5">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-4">{children}</div>
        </main>
      </div>
    </div>
  );
}
