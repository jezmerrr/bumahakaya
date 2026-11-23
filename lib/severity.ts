import type { Severity, WaterLevel } from "./types";

const COLORS: Record<Severity, string> = {
  Passable: "#2e9e5b",
  Caution: "#e8972a",
  Impassable: "#d64550",
};

const LABELS: Record<Severity, string> = {
  Passable: "Madadaanan / Passable",
  Caution: "Mag-ingat / Gutter-deep",
  Impassable: "Hindi madaanan / Not passable",
};

export function severityColor(severity: Severity): string {
  return COLORS[severity];
}

export function severityLabel(severity: Severity): string {
  return LABELS[severity];
}

export function waterLevelToSeverity(level: WaterLevel): Severity {
  return level === "Waist+" ? "Impassable" : "Caution";
}
