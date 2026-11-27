import type { SensorReading } from "./types";

// Water level (cm) at or above which a street is treated as "not passable".
// Matches the seed data where ~45 cm and up are flagged Impassable.
export const IMPASSABLE_CM = 45;

export type RangeKey = "24h" | "7d" | "14d";

export const RANGE_HOURS: Record<RangeKey, number> = {
  "24h": 24,
  "7d": 168,
  "14d": 336,
};

export const RANGE_LABEL: Record<RangeKey, string> = {
  "24h": "24h",
  "7d": "7 days",
  "14d": "14 days",
};

const HOUR = 3_600_000;

/** Readings whose timestamp falls within `hours` before `now`. */
export function readingsWithin(
  readings: SensorReading[],
  hours: number,
  now: number = Date.now(),
): SensorReading[] {
  const cutoff = now - hours * HOUR;
  return readings.filter((r) => {
    const t = Date.parse(r.timestamp);
    return t >= cutoff && t <= now;
  });
}

export interface SeriesPoint {
  t: number;
  cm: number;
}

/**
 * Average water level across all sensors, grouped into `buckets` equal time
 * slices across the window. Empty buckets carry the previous value so the
 * line stays continuous; ascending in time.
 */
export function averagedSeries(
  readings: SensorReading[],
  hours: number,
  buckets: number,
  now: number = Date.now(),
): SeriesPoint[] {
  const start = now - hours * HOUR;
  const span = hours * HOUR;
  const sums = new Array(buckets).fill(0);
  const counts = new Array(buckets).fill(0);

  for (const r of readings) {
    const t = Date.parse(r.timestamp);
    if (t < start || t > now) continue;
    let idx = Math.floor(((t - start) / span) * buckets);
    if (idx < 0) idx = 0;
    if (idx >= buckets) idx = buckets - 1;
    sums[idx] += r.cm;
    counts[idx] += 1;
  }

  const points: SeriesPoint[] = [];
  let last = 0;
  for (let i = 0; i < buckets; i++) {
    const cm = counts[i] > 0 ? Math.round(sums[i] / counts[i]) : last;
    last = cm;
    points.push({ t: Math.round(start + ((i + 0.5) / buckets) * span), cm });
  }
  return points;
}

export interface Hotspot {
  streetName: string;
  floodEvents: number;
  peakCm: number;
  hoursFlooded: number;
}

/**
 * Rank streets by how often they flood in the window. A "flood event" is a
 * rising crossing of the impassable threshold (below -> at/above). Streets
 * that never cross the threshold are excluded.
 */
export function floodHotspots(
  readings: SensorReading[],
  hours: number,
  now: number = Date.now(),
  threshold: number = IMPASSABLE_CM,
): Hotspot[] {
  const windowed = readingsWithin(readings, hours, now);

  // Group by sensor to detect events per device, then roll up to street.
  const bySensor = new Map<string, SensorReading[]>();
  for (const r of windowed) {
    const list = bySensor.get(r.sensorId);
    if (list) list.push(r);
    else bySensor.set(r.sensorId, [r]);
  }

  const byStreet = new Map<string, Hotspot>();

  for (const list of bySensor.values()) {
    const sorted = [...list].sort(
      (a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp),
    );
    let wasFlooded = false;
    for (const r of sorted) {
      const street = r.streetName;
      const entry =
        byStreet.get(street) ??
        { streetName: street, floodEvents: 0, peakCm: 0, hoursFlooded: 0 };
      const flooded = r.cm >= threshold;
      if (flooded) {
        if (!wasFlooded) entry.floodEvents += 1; // rising edge = new event
        entry.hoursFlooded += 1;
        if (r.cm > entry.peakCm) entry.peakCm = r.cm;
      }
      wasFlooded = flooded;
      byStreet.set(street, entry);
    }
  }

  return [...byStreet.values()]
    .filter((h) => h.floodEvents > 0)
    .sort(
      (a, b) =>
        b.floodEvents - a.floodEvents ||
        b.hoursFlooded - a.hoursFlooded ||
        b.peakCm - a.peakCm,
    );
}

/** Serialize readings to CSV for the downloadable flood report. */
export function readingsToCSV(readings: SensorReading[]): string {
  const esc = (v: string | number): string => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = "timestamp,sensorId,streetName,cm";
  const rows = readings.map(
    (r) =>
      `${esc(r.timestamp)},${esc(r.sensorId)},${esc(r.streetName)},${esc(r.cm)}`,
  );
  return [header, ...rows].join("\n") + "\n";
}
