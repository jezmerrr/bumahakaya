import { distanceMeters, type LatLng } from "./geo";
import type { Report, Severity, WaterLevel } from "./types";

const DEPTH_RANK: Record<WaterLevel, number> = { Ankle: 0, Knee: 1, "Waist+": 2 };
const WORST_FIRST: Record<Severity, number> = {
  Impassable: 0,
  Caution: 1,
  Passable: 2,
};

const time = (r: Report) => new Date(r.timestamp).getTime();

export interface NearbyItem {
  report: Report;
  distanceM: number;
}

// Reports and sensors within `radiusM` of `center`, optionally one road
// condition only. Worst road condition first, then newest.
export function nearbyItems(
  markers: Report[],
  center: LatLng,
  radiusM: number,
  severity: Severity | null,
): NearbyItem[] {
  return markers
    .map((report) => ({ report, distanceM: distanceMeters(center, report) }))
    .filter(
      (i) =>
        i.distanceM <= radiusM &&
        (severity === null || i.report.severity === severity),
    )
    .sort(
      (a, b) =>
        WORST_FIRST[a.report.severity] - WORST_FIRST[b.report.severity] ||
        time(b.report) - time(a.report),
    );
}

export interface NearbySummary {
  count: number;
  closest: NearbyItem;
  deepest: NearbyItem;
  latest: NearbyItem;
}

// The three highlights on the map's summary card.
export function summarize(items: NearbyItem[]): NearbySummary | null {
  if (items.length === 0) return null;
  let closest = items[0];
  let deepest = items[0];
  let latest = items[0];
  for (const i of items) {
    if (i.distanceM < closest.distanceM) closest = i;
    if (DEPTH_RANK[i.report.waterLevel] > DEPTH_RANK[deepest.report.waterLevel])
      deepest = i;
    if (time(i.report) > time(latest.report)) latest = i;
  }
  return { count: items.length, closest, deepest, latest };
}

export function countBySeverity(markers: Report[]): Record<Severity, number> {
  const counts: Record<Severity, number> = {
    Impassable: 0,
    Caution: 0,
    Passable: 0,
  };
  for (const m of markers) counts[m.severity] += 1;
  return counts;
}

// Newest report or sensor reading, for "Updated 3m ago".
export function newestTimestamp(markers: Report[]): string | null {
  let best: Report | null = null;
  for (const m of markers) if (!best || time(m) > time(best)) best = m;
  return best?.timestamp ?? null;
}

export interface AreaStatus {
  // Worst road condition reported nearby (Passable when nothing is reported).
  severity: Severity;
  // How many nearby reports share that worst condition...
  count: number;
  // ...split into community reports and sensors (the feed only lists reports).
  reports: number;
  sensors: number;
  // The one to warn about first: worst condition, then deepest, then closest.
  worst: NearbyItem | null;
}

export function areaStatus(items: NearbyItem[]): AreaStatus {
  if (items.length === 0)
    return { severity: "Passable", count: 0, reports: 0, sensors: 0, worst: null };
  const ranked = [...items].sort(
    (a, b) =>
      WORST_FIRST[a.report.severity] - WORST_FIRST[b.report.severity] ||
      DEPTH_RANK[b.report.waterLevel] - DEPTH_RANK[a.report.waterLevel] ||
      a.distanceM - b.distanceM,
  );
  const severity = ranked[0].report.severity;
  const same = items.filter((i) => i.report.severity === severity);
  const sensors = same.filter((i) => i.report.source === "sensor").length;
  return {
    severity,
    count: same.length,
    reports: same.length - sensors,
    sensors,
    worst: ranked[0],
  };
}
