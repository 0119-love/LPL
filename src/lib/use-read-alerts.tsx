"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "verdict-read-alerts";

function loadRead(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

type ReadAlertsContextValue = {
  readIds: Set<string>;
  toggleRead: (id: string) => void;
};

const ReadAlertsContext = createContext<ReadAlertsContextValue | null>(null);

export function ReadAlertsProvider({ children }: { children: React.ReactNode }) {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setReadIds(loadRead());
  }, []);

  const toggleRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  return (
    <ReadAlertsContext.Provider value={{ readIds, toggleRead }}>
      {children}
    </ReadAlertsContext.Provider>
  );
}

export function useReadAlerts() {
  const ctx = useContext(ReadAlertsContext);
  if (!ctx) {
    throw new Error("useReadAlerts must be used within a ReadAlertsProvider");
  }
  return ctx;
}
