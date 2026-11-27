import { describe, expect, it } from "vitest";
import {
  countBySeverity,
  nearbyItems,
  newestTimestamp,
  summarize,
} from "./mapSummary";
import type { Report } from "./types";

const CENTER = { lat: 14.5647, lng: 120.9936 };
const ago = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

function report(over: Partial<Report> & { id: string }): Report {
  return {
    lat: CENTER.lat,
    lng: CENTER.lng,
    streetName: "Test St",
    severity: "Passable",
    waterLevel: "Ankle",
    passable: true,
    source: "community",
    timestamp: ago(10),
    ...over,
  };
}

const near = report({ id: "near", lat: 14.5648, severity: "Caution", waterLevel: "Knee", timestamp: ago(30) });
const deep = report({ id: "deep", lat: 14.5665, severity: "Impassable", waterLevel: "Waist+", timestamp: ago(20) });
const fresh = report({ id: "fresh", lat: 14.566, severity: "Passable", timestamp: ago(1) });
const far = report({ id: "far", lat: 14.58, severity: "Impassable", waterLevel: "Waist+" });
const all = [near, deep, fresh, far];

describe("nearbyItems", () => {
  it("keeps reports within the radius, worst condition first", () => {
    const items = nearbyItems(all, CENTER, 700, null);
    expect(items.map((i) => i.report.id)).toEqual(["deep", "near", "fresh"]);
    expect(items[1].distanceM).toBeLessThan(20);
  });

  it("filters to one road condition", () => {
    const items = nearbyItems(all, CENTER, 700, "Passable");
    expect(items.map((i) => i.report.id)).toEqual(["fresh"]);
  });
});

describe("summarize", () => {
  it("finds the closest, deepest, and latest report", () => {
    const s = summarize(nearbyItems(all, CENTER, 700, null))!;
    expect(s.count).toBe(3);
    expect(s.closest.report.id).toBe("near");
    expect(s.deepest.report.id).toBe("deep");
    expect(s.latest.report.id).toBe("fresh");
  });

  it("returns null when nothing is nearby", () => {
    expect(summarize([])).toBeNull();
  });
});

describe("countBySeverity and newestTimestamp", () => {
  it("counts each road condition", () => {
    expect(countBySeverity(all)).toEqual({ Impassable: 2, Caution: 1, Passable: 1 });
  });

  it("finds the newest timestamp", () => {
    expect(newestTimestamp(all)).toBe(fresh.timestamp);
    expect(newestTimestamp([])).toBeNull();
  });
});
