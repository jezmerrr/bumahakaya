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

export function severityShort(severity: Severity): string {
  return SHORT_LABELS[severity];
}

export function severityColor(severity: Severity): string {
  return COLORS[severity];
}

export function severityLabel(severity: Severity): string {
  return LABELS[severity];
}

export function waterLevelToSeverity(level: WaterLevel): Severity {
  return level === "Waist+" ? "Impassable" : "Caution";
}
