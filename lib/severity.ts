import type { Severity, WaterLevel } from "./types";

const COLORS: Record<Severity, string> = {
  Passable: "#17845a",
  Caution: "#e8972a",
  Impassable: "#c93a3a",
};

const LABELS: Record<Severity, string> = {
  Passable: "Madadaanan / Passable",
  Caution: "Mag-ingat / Gutter-deep",
  Impassable: "Hindi madaanan / Not passable",
};

const SHORT_LABELS: Record<Severity, string> = {
  Passable: "Passable",
  Caution: "Gutter-deep",
  Impassable: "Not passable",
};

const WATER_LABELS: Record<WaterLevel, string> = {
  Ankle: "Ankle-deep",
  Knee: "Knee-deep",
  "Waist+": "Waist-deep",
};

export function waterLevelLabel(level: WaterLevel): string {
  return WATER_LABELS[level];
}

export function severityShort(severity: Severity): string {
  return SHORT_LABELS[severity];
}

export function severityColor(severity: Severity): string {
  return COLORS[severity];
}

// Darker shades for text, icons, and anything with white text on it. The
// bright colors above are for pins, dots, and bars; as text (or behind white
// text) amber in particular is too light to read (2.4:1). These are all 5:1+.
const INK: Record<Severity, string> = {
  Passable: "#136f4c",
  Caution: "#a35f0c",
  Impassable: "#b42f2f",
};

export function severityInk(severity: Severity): string {
  return INK[severity];
}

export function severityLabel(severity: Severity): string {
  return LABELS[severity];
}

export function waterLevelToSeverity(level: WaterLevel): Severity {
  return level === "Waist+" ? "Impassable" : "Caution";
}
