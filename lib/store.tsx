"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Announcement, Comment, Report, SocialPost } from "./types";
import {
  seedAnnouncements,
  seedComments,
  seedReports,
  seedSensors,
  seedSocial,
} from "@/data/seed";

const REPORTS_KEY = "bk.reports.v1";
const COMMENTS_KEY = "bk.comments.v1";

export type NewReport = Omit<Report, "id" | "timestamp" | "source">;

interface StoreValue {
  reports: Report[];
  sensors: Report[];
  announcements: Announcement[];
  social: SocialPost[];
  comments: Comment[];
  addReport: (input: NewReport) => void;
  addComment: (reportId: string, text: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function loadJSON<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T[]): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable — keep in-memory state
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
  const [comments, setComments] = useState<Comment[]>(seedComments);

  useEffect(() => {
    setReports(loadJSON(REPORTS_KEY, seedReports));
    setComments(loadJSON(COMMENTS_KEY, seedComments));
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
      save(REPORTS_KEY, next);
      return next;
    });
  }, []);

  const addComment = useCallback((reportId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const comment: Comment = {
      id: makeId(),
      reportId,
      author: "you",
      text: trimmed,
      timestamp: new Date().toISOString(),
    };
    setComments((prev) => {
      const next = [comment, ...prev];
      save(COMMENTS_KEY, next);
      return next;
    });
  }, []);

  const value: StoreValue = {
    reports,
    sensors: seedSensors,
    announcements: seedAnnouncements,
    social: seedSocial,
    comments,
    addReport,
    addComment,
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
