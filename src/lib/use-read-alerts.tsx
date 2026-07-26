"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

const STORAGE_KEY = "verdict-read-alerts";
const CHANGE_EVENT = "verdict-read-alerts-change";

function readRaw(): string {
  if (typeof window === "undefined") return "[]";
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function getServerSnapshot(): string {
  return "[]";
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

type ReadAlertsContextValue = {
  readIds: Set<string>;
  toggleRead: (id: string) => void;
};

const ReadAlertsContext = createContext<ReadAlertsContextValue | null>(null);

export function ReadAlertsProvider({ children }: { children: React.ReactNode }) {
  const raw = useSyncExternalStore(subscribe, readRaw, getServerSnapshot);
  const readIds = useMemo(() => {
    try {
      return new Set<string>(JSON.parse(raw));
    } catch {
      return new Set<string>();
    }
  }, [raw]);

  const toggleRead = useCallback((id: string) => {
    const current = new Set<string>(JSON.parse(readRaw()));
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...current]));
    window.dispatchEvent(new Event(CHANGE_EVENT));
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
