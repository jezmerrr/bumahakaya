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

// Darker shades for anything with white text on it (tags, selected chips).
// The bright colors above are for pins, dots, and bars; behind white text
// amber in particular is too light (2.4:1). These are all 5:1+, in both themes.
const FILL: Record<Severity, string> = {
  Passable: "#136f4c",
  Caution: "#a35f0c",
  Impassable: "#b42f2f",
};

export function severityFill(severity: Severity): string {
  return FILL[severity];
}

// Colored text and icons. CSS variables (app/globals.css) so they get lighter
// in dark mode and stay readable on dark cards.
const INK: Record<Severity, string> = {
  Passable: "var(--sev-ink-pass)",
  Caution: "var(--sev-ink-caution)",
  Impassable: "var(--sev-ink-impass)",
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
