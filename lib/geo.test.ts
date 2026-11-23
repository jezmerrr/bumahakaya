import { describe, expect, it } from "vitest";
import { distanceMeters, reportsNearby } from "./geo";
import type { Report } from "./types";

const DLSU = { lat: 14.5647, lng: 120.9936 };

function report(id: string, lat: number, lng: number): Report {
  return {
    id,
    lat,
    lng,
    streetName: "Taft Ave",
    severity: "Caution",
    waterLevel: "Knee",
    passable: true,
    source: "community",
    timestamp: new Date().toISOString(),
  };
}

describe("distanceMeters", () => {
  it("is zero for identical points", () => {
    expect(distanceMeters(DLSU, DLSU)).toBeCloseTo(0, 5);
  });

  it("is ~111m for 0.001 degrees of latitude", () => {
    const d = distanceMeters(DLSU, { lat: DLSU.lat + 0.001, lng: DLSU.lng });
    expect(d).toBeGreaterThan(109);
    expect(d).toBeLessThan(113);
  });
});

describe("reportsNearby", () => {
  it("returns only reports inside the radius", () => {
    const near = report("near", DLSU.lat + 0.0005, DLSU.lng); // ~55m
    const far = report("far", DLSU.lat + 0.01, DLSU.lng); // ~1.1km
    const result = reportsNearby(DLSU, [near, far], 400);
    expect(result.map((r) => r.id)).toEqual(["near"]);
  });
});
