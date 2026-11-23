import { describe, expect, it } from "vitest";
import { severityColor, severityLabel, waterLevelToSeverity } from "./severity";

describe("severityColor", () => {
  it("maps each severity to its brand hex", () => {
    expect(severityColor("Passable")).toBe("#2e9e5b");
    expect(severityColor("Caution")).toBe("#e8972a");
    expect(severityColor("Impassable")).toBe("#d64550");
  });
});

describe("severityLabel", () => {
  it("gives the bilingual road-status label", () => {
    expect(severityLabel("Passable")).toBe("Madadaanan / Passable");
    expect(severityLabel("Caution")).toBe("Mag-ingat / Gutter-deep");
    expect(severityLabel("Impassable")).toBe("Hindi madaanan / Not passable");
  });
});

describe("waterLevelToSeverity", () => {
  it("escalates with water level", () => {
    expect(waterLevelToSeverity("Ankle")).toBe("Caution");
    expect(waterLevelToSeverity("Knee")).toBe("Caution");
    expect(waterLevelToSeverity("Waist+")).toBe("Impassable");
  });
});
