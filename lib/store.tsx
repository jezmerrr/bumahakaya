"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type {
  Announcement,
  Comment,
  Report,
  SensorReading,
  SocialPost,
} from "./types";
import {
  seedAnnouncements,
  seedComments,
  seedReports,
  seedSensorHistory,
  seedSensors,
  seedSocial,
} from "@/data/seed";
import { CURRENT_USER } from "./user";

const REPORTS_KEY = "bk.reports.v1";
const COMMENTS_KEY = "bk.comments.v1";
// Ids of reports the current user confirmed (one vote per person per report).
const CONFIRMS_KEY = "bk.confirms.v1";

export type NewReport = Omit<Report, "id" | "timestamp" | "source">;
export type ReportChanges = Partial<
  Omit<Report, "id" | "timestamp" | "source" | "author" | "editedAt">
>;

interface StoreValue {
  reports: Report[];
  sensors: Report[];
  sensorHistory: SensorReading[];
  announcements: Announcement[];
  social: SocialPost[];
  comments: Comment[];
  addReport: (input: NewReport) => void;
  addComment: (reportId: string, text: string) => void;
  updateReport: (id: string, changes: ReportChanges) => void;
  removeReport: (id: string) => void;
  removeComment: (id: string) => void;
  isConfirmed: (reportId: string) => boolean;
  // Seed confirmations plus the current user's own vote, if any.
  confirmCount: (report: Report) => number;
  toggleConfirm: (reportId: string) => void;
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
    // storage unavailable, keep in-memory state
  }
}

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `r-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Browsers that saved posts before the sample photos existed keep their old
// copies, so give untouched sample posts their photo back. Posts the user
// edited (they may have removed the photo on purpose) are left alone.
export function withSeedPhotos(stored: Report[]): Report[] {
  const seedById = new Map(seedReports.map((r) => [r.id, r]));
  return stored.map((r) => {
    const seed = seedById.get(r.id);
    if (!seed?.photoUrl || r.photoUrl || r.editedAt) return r;
    return { ...r, photoUrl: seed.photoUrl, photoCredit: seed.photoCredit };
  });
}

export function StoreProvider({ children }: { children: ReactNode }) {
  // Saved data is read on first render. That's safe here: the server-rendered
  // page is the Start screen, which shows none of this data, so the client's
  // saved posts can't cause a hydration mismatch.
  const [reports, setReports] = useState<Report[]>(() =>
    withSeedPhotos(loadJSON(REPORTS_KEY, seedReports)),
  );
  const [comments, setComments] = useState<Comment[]>(() =>
    loadJSON(COMMENTS_KEY, seedComments),
  );
  const [confirmedIds, setConfirmedIds] = useState<string[]>(() =>
    loadJSON<string>(CONFIRMS_KEY, []),
  );

  const isConfirmed = useCallback(
    (reportId: string) => confirmedIds.includes(reportId),
    [confirmedIds],
  );

  const confirmCount = useCallback(
    (report: Report) =>
      (report.confirms ?? 0) + (confirmedIds.includes(report.id) ? 1 : 0),
    [confirmedIds],
  );

  const toggleConfirm = useCallback((reportId: string) => {
    setConfirmedIds((prev) => {
      const next = prev.includes(reportId)
        ? prev.filter((id) => id !== reportId)
        : [...prev, reportId];
      save(CONFIRMS_KEY, next);
      return next;
    });
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
      author: CURRENT_USER.handle,
      text: trimmed,
      timestamp: new Date().toISOString(),
    };
    setComments((prev) => {
      const next = [comment, ...prev];
      save(COMMENTS_KEY, next);
      return next;
    });
  }, []);

  const updateReport = useCallback((id: string, changes: ReportChanges) => {
    const editedAt = new Date().toISOString();
    setReports((prev) => {
      const next = prev.map((r) =>
        r.id === id ? { ...r, ...changes, editedAt } : r,
      );
      save(REPORTS_KEY, next);
      return next;
    });
  }, []);

  const removeReport = useCallback((id: string) => {
    setReports((prev) => {
      const next = prev.filter((r) => r.id !== id);
      save(REPORTS_KEY, next);
      return next;
    });
  }, []);

  const removeComment = useCallback((id: string) => {
    setComments((prev) => {
      const next = prev.filter((c) => c.id !== id);
      save(COMMENTS_KEY, next);
      return next;
    });
  }, []);

  const value: StoreValue = {
    reports,
    sensors: seedSensors,
    sensorHistory: seedSensorHistory,
    announcements: seedAnnouncements,
    social: seedSocial,
    comments,
    addReport,
    addComment,
    updateReport,
    removeReport,
    removeComment,
    isConfirmed,
    confirmCount,
    toggleConfirm,
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
