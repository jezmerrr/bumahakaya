import { describe, expect, it } from "vitest";
import { seedReports, seedSensors } from "@/data/seed";
import {
  agreeingReports,
  levelForCm,
  smartCheck,
  withPhotoCheck,
  type CheckItem,
} from "./smartCheck";
import type { Report } from "./types";

const isDisputed = (r: Report) => (r.flags ?? 0) >= 3;
const seed = (id: string) => seedReports.find((r) => r.id === id)!;

function check(report: Report, confirms = report.confirms ?? 0, now = new Date()) {
  return smartCheck({
    report,
    reports: seedReports,
    sensors: seedSensors,
    confirms,
    isDisputed,
    now,
  });
}

const minsAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

// A new post with no sensor reading of its own, like one from the Report tab.
function newReport(changes: Partial<Report>): Report {
  return {
    id: "new",
    lat: 14.5647,
    lng: 120.9936, // DLSU
    streetName: "Agno St cor. Taft",
    severity: "Caution",
    waterLevel: "Knee",
    passable: true,
    source: "community",
    timestamp: minsAgo(1),
    ...changes,
  };
}

describe("levelForCm", () => {
  it("splits readings into ankle, knee, and waist-deep", () => {
    expect(levelForCm(0)).toBe("Ankle");
    expect(levelForCm(14)).toBe("Ankle");
    expect(levelForCm(15)).toBe("Knee");
    expect(levelForCm(49)).toBe("Knee");
    expect(levelForCm(50)).toBe("Waist+");
  });

  it("matches the depth on every sample sensor", () => {
    for (const s of seedSensors) expect(levelForCm(s.sensorCm!)).toBe(s.waterLevel);
  });
});

describe("smartCheck on the sample reports", () => {
  it("marks the Estrada report likely accurate: sensor and people agree", () => {
    const r = check(seed("r-001"));
    expect(r.verdict).toBe("likely");
    expect(r.items.find((i) => i.key === "sensor")?.status).toBe("pass");
    expect(r.items.find((i) => i.key === "crowd")?.detail).toMatch(/12 people confirmed it/);
  });

  it("asks to check the Henry report: the sensor reads deeper", () => {
    const r = check(seed("r-002"));
    expect(r.verdict).toBe("check");
    const sensor = r.items.find((i) => i.key === "sensor")!;
    expect(sensor.title).toBe("Sensor reads deeper");
    expect(sensor.detail).toMatch(/71 cm, waist-deep/);
  });

  it("calls the flagged Castro report disputed", () => {
    expect(check(seed("r-007")).verdict).toBe("disputed");
  });

  it("finds every other sample report likely accurate", () => {
    for (const r of seedReports) {
      if (r.id === "r-002" || r.id === "r-007") continue;
      expect(check(r).verdict, r.id).toBe("likely");
    }
  });
});

describe("smartCheck on a new report", () => {
  it("uses the closest sensor when the report has no reading", () => {
    // Sensor 03 (64 cm) is about 120 m from DLSU.
    const r = check(newReport({ waterLevel: "Knee" }), 0);
    expect(r.verdict).toBe("check");
    expect(r.items[0].detail).toMatch(/The sensor \d+ m away reads 64 cm/);
  });

  it("agrees once the depth matches the sensor", () => {
    const r = check(newReport({ waterLevel: "Waist+", severity: "Impassable" }), 0);
    expect(r.verdict).toBe("likely");
    expect(r.items[0].title).toBe("Sensor agrees");
  });

  it("is not verified yet with no sensor, no confirms, and no one nearby", () => {
    const far = newReport({ lat: 14.58, lng: 121.0 });
    const r = check(far, 0);
    expect(r.verdict).toBe("unverified");
    expect(r.items.map((i) => i.title)).toEqual([
      "No sensor nearby",
      "Not confirmed yet",
      "Recent",
    ]);
  });

  it("says a bit old after an hour and may be outdated after three", () => {
    const far = { lat: 14.58, lng: 121.0 };
    const twoHours = check(newReport({ ...far, timestamp: minsAgo(120) }), 5);
    expect(twoHours.items[2].title).toBe("A bit old");
    expect(twoHours.verdict).toBe("likely");

    const fourHours = check(newReport({ ...far, timestamp: minsAgo(240) }), 5);
    expect(fourHours.items[2].title).toBe("May be outdated");
    expect(fourHours.verdict).toBe("check");
  });

  it("counts freshness from the last edit", () => {
    const edited = newReport({
      lat: 14.58,
      lng: 121.0,
      timestamp: minsAgo(240),
      editedAt: minsAgo(2),
    });
    expect(check(edited, 5).items[2].detail).toMatch(/^Updated 2m ago/);
  });
});

describe("agreeingReports", () => {
  it("counts nearby, same-depth reports, but not disputed ones", () => {
    const ids = (r: Report) => agreeingReports(r, seedReports, isDisputed).map((o) => o.id);
    // Leon Guinto has knee-deep reports from Estrada and near PWU close by.
    expect(ids(seed("r-006")).sort()).toEqual(["r-001", "r-008"]);
    // Castro (ankle-deep) is near Taft near campus but disputed.
    expect(ids(seed("r-004"))).toEqual([]);
  });
});

describe("withPhotoCheck", () => {
  const reused: CheckItem = {
    key: "photo",
    status: "warn",
    title: "Photo already posted",
    detail: "",
  };

  it("turns likely into check when the photo was already posted", () => {
    const r = withPhotoCheck(check(seed("r-001")), reused);
    expect(r.verdict).toBe("check");
    expect(r.items.at(-1)).toBe(reused);
  });

  it("keeps the verdict for an original photo", () => {
    const r = withPhotoCheck(check(seed("r-001")), { ...reused, status: "pass" });
    expect(r.verdict).toBe("likely");
    expect(r.items).toHaveLength(4);
  });
});
