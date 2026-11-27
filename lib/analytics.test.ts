import { describe, expect, it } from "vitest";
import {
  IMPASSABLE_CM,
  RANGE_HOURS,
  averagedSeries,
  floodHotspots,
  readingsToCSV,
  readingsWithin,
} from "./analytics";
import type { SensorReading } from "./types";

const HOUR = 3_600_000;
const NOW = Date.parse("2026-11-20T12:00:00.000Z");

// Build a reading `hoursAgo` before NOW.
function reading(
  sensorId: string,
  streetName: string,
  cm: number,
  hoursAgo: number,
): SensorReading {
  return {
    sensorId,
    streetName,
    cm,
    timestamp: new Date(NOW - hoursAgo * HOUR).toISOString(),
  };
}

describe("readingsWithin", () => {
  it("keeps only readings inside the window", () => {
    const data = [
      reading("s1", "Agno St", 10, 1),
      reading("s1", "Agno St", 20, 25), // outside 24h
      reading("s1", "Agno St", 30, 5),
    ];
    const kept = readingsWithin(data, 24, NOW);
    expect(kept).toHaveLength(2);
    expect(kept.map((r) => r.cm).sort()).toEqual([10, 30]);
  });
});

describe("averagedSeries", () => {
  it("returns the requested number of buckets, ascending in time", () => {
    const data = [
      reading("s1", "Agno St", 40, 1),
      reading("s2", "Taft Ave", 60, 1),
      reading("s1", "Agno St", 10, 23),
    ];
    const series = averagedSeries(data, 24, 6, NOW);
    expect(series).toHaveLength(6);
    // ascending timestamps
    for (let i = 1; i < series.length; i++) {
      expect(series[i].t).toBeGreaterThan(series[i - 1].t);
    }
    // the most recent bucket averages the two latest readings (40 + 60) / 2
    expect(series[series.length - 1].cm).toBe(50);
  });
});

describe("floodHotspots", () => {
  it("ranks streets by number of flood events (threshold crossings)", () => {
    // Agno floods twice (down-up-down-up), Taft once.
    const data = [
      reading("s1", "Agno St", 10, 10),
      reading("s1", "Agno St", IMPASSABLE_CM + 5, 9), // event 1 start
      reading("s1", "Agno St", 10, 8), // recede
      reading("s1", "Agno St", IMPASSABLE_CM + 20, 7), // event 2 start (peak)
      reading("s1", "Agno St", 10, 6),
      reading("s2", "Taft Ave", 5, 10),
      reading("s2", "Taft Ave", IMPASSABLE_CM + 1, 9), // event 1
      reading("s2", "Taft Ave", 5, 8),
    ];
    const ranked = floodHotspots(data, 24, NOW);
    expect(ranked[0].streetName).toBe("Agno St");
    expect(ranked[0].floodEvents).toBe(2);
    expect(ranked[0].peakCm).toBe(IMPASSABLE_CM + 20);
    expect(ranked[1].streetName).toBe("Taft Ave");
    expect(ranked[1].floodEvents).toBe(1);
  });

  it("excludes streets that never crossed the threshold", () => {
    const data = [
      reading("s3", "Dry Rd", 5, 3),
      reading("s3", "Dry Rd", 12, 2),
    ];
    expect(floodHotspots(data, 24, NOW)).toHaveLength(0);
  });
});

describe("readingsToCSV", () => {
  it("produces a header and one row per reading", () => {
    const data = [reading("s1", "Agno St", 40, 1)];
    const csv = readingsToCSV(data);
    const lines = csv.trim().split("\n");
    expect(lines[0]).toBe("timestamp,sensorId,streetName,cm");
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain("Agno St");
    expect(lines[1]).toContain("40");
  });

  it("quotes street names that contain commas", () => {
    const data = [reading("s1", "Taft Ave, Malate", 40, 1)];
    const csv = readingsToCSV(data);
    expect(csv).toContain('"Taft Ave, Malate"');
  });
});

describe("RANGE_HOURS", () => {
  it("maps range keys to hour counts", () => {
    expect(RANGE_HOURS["24h"]).toBe(24);
    expect(RANGE_HOURS["7d"]).toBe(168);
    expect(RANGE_HOURS["14d"]).toBe(336);
  });
});
