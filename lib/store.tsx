"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Announcement, Report, SocialPost } from "./types";
import {
  seedAnnouncements,
  seedReports,
  seedSensors,
  seedSocial,
} from "@/data/seed";

const REPORTS_KEY = "bk.reports.v1";

export type NewReport = Omit<Report, "id" | "timestamp" | "source">;

interface StoreValue {
  reports: Report[];
  sensors: Report[];
  announcements: Announcement[];
  social: SocialPost[];
  addReport: (input: NewReport) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function loadReports(): Report[] {
  if (typeof window === "undefined") return seedReports;
  try {
    const raw = window.localStorage.getItem(REPORTS_KEY);
    if (!raw) return seedReports;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Report[]) : seedReports;
  } catch {
    return seedReports;
  }
}

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `r-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<Report[]>(seedReports);

  useEffect(() => {
    setReports(loadReports());
  }, []);

  const addReport = useCallback((input: NewReport) => {
    const report: Report = {
      ...input,
      id: makeId(),
      source: "community",
      timestamp: new Date().toISOString(),
    };
    setReports((prev) => {
      const next = [report, ...prev];
      try {
        window.localStorage.setItem(REPORTS_KEY, JSON.stringify(next));
      } catch {
        // storage unavailable — keep in-memory state
      }
      return next;
    });
  }, []);

  const value: StoreValue = {
    reports,
    sensors: seedSensors,
    announcements: seedAnnouncements,
    social: seedSocial,
    addReport,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return ctx;
}
