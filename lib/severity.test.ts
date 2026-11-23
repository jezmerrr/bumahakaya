import { describe, expect, it } from "vitest";
import {
  severityColor,
  severityLabel,
  severityShort,
  waterLevelToSeverity,
} from "./severity";

describe("severityColor", () => {
  it("maps each severity to its brand hex", () => {
    expect(severityColor("Passable")).toBe("#17845a");
    expect(severityColor("Caution")).toBe("#e8972a");
    expect(severityColor("Impassable")).toBe("#c93a3a");
  });
});

describe("severityLabel", () => {
  it("gives the bilingual road-status label", () => {
    expect(severityLabel("Passable")).toBe("Madadaanan / Passable");
    expect(severityLabel("Caution")).toBe("Mag-ingat / Gutter-deep");
    expect(severityLabel("Impassable")).toBe("Hindi madaanan / Not passable");
  });
});

describe("severityShort", () => {
  it("gives the short English road-status label", () => {
    expect(severityShort("Passable")).toBe("Passable");
    expect(severityShort("Caution")).toBe("Gutter-deep");
    expect(severityShort("Impassable")).toBe("Not passable");
  });
});

describe("waterLevelToSeverity", () => {
  it("escalates with water level", () => {
    expect(waterLevelToSeverity("Ankle")).toBe("Caution");
    expect(waterLevelToSeverity("Knee")).toBe("Caution");
    expect(waterLevelToSeverity("Waist+")).toBe("Impassable");
  });
});
