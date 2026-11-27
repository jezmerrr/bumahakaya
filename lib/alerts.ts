import type { Announcement } from "./types";

// What an alert is about, from the student's point of view.
export type AlertCategory = "classes" | "roads" | "water" | "weather" | "advisory";

// Chip order on the Alerts tab: most actionable first.
export const ALERT_CATEGORIES: AlertCategory[] = [
  "classes",
  "roads",
  "water",
  "weather",
  "advisory",
];

export function alertCategory(a: Announcement): AlertCategory {
  if (a.type === "suspension" || a.source === "school") return "classes";
  if (a.type === "closure") return "roads";
  if (a.source === "sensor") return "water";
  if (a.source === "weather") return "weather";
  return "advisory";
}

const MIN = 60_000;
const NEW_MINUTES = 30;

const ageMinutes = (a: Announcement, now: Date) =>
  (now.getTime() - new Date(a.timestamp).getTime()) / MIN;

// Shown with a "New" marker.
export function isNewAlert(a: Announcement, now: Date = new Date()): boolean {
  return ageMinutes(a, now) < NEW_MINUTES;
}

export interface AlertGroup {
  label: "Last hour" | "Earlier today" | "Older";
  items: Announcement[];
}

// Newest first, split into "Last hour", "Earlier today" (within 24 hours),
// and "Older". Empty groups are left out.
export function groupAlerts(
  alerts: Announcement[],
  now: Date = new Date(),
): AlertGroup[] {
  const sorted = [...alerts].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
  const groups: AlertGroup[] = [
    { label: "Last hour", items: [] },
    { label: "Earlier today", items: [] },
    { label: "Older", items: [] },
  ];
  for (const a of sorted) {
    const age = ageMinutes(a, now);
    groups[age < 60 ? 0 : age < 24 * 60 ? 1 : 2].items.push(a);
  }
  return groups.filter((g) => g.items.length > 0);
}
