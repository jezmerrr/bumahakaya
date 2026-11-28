import { distanceMeters } from "./geo";
import { waterLevelLabel } from "./severity";
import { relativeTime } from "./time";
import type { Report, WaterLevel } from "./types";

// Smart check: quick checks the app runs on every community report to say how
// much to trust it. Everything here runs on the phone, so it's free and
// nothing is sent anywhere. In the pilot an AI model takes over these checks;
// the result keeps the same shape, so the screens don't change.

// A sensor this close counts as "nearby" when a report has no reading of its own.
export const SENSOR_RADIUS_M = 250;
// Other reports this close, and this recent, are about the same flood.
export const NEARBY_RADIUS_M = 200;
export const FRESH_MINUTES = 60;
export const STALE_MINUTES = 180;
// Confirmations that count as "other people agree".
export const CROWD_CONFIRMS = 3;

const LEVEL_RANK: Record<WaterLevel, number> = { Ankle: 0, Knee: 1, "Waist+": 2 };

// Depth for a sensor reading, matching the labels on the sample sensors:
// under 15 cm is ankle-deep, under 50 cm knee-deep, 50 cm and up waist-deep.
export function levelForCm(cm: number): WaterLevel {
  if (cm < 15) return "Ankle";
  if (cm < 50) return "Knee";
  return "Waist+";
}

export type CheckStatus = "pass" | "warn" | "info";

export interface CheckItem {
  key: "sensor" | "crowd" | "fresh" | "photo";
  status: CheckStatus;
  title: string;
  detail: string;
}

export type Verdict = "likely" | "check" | "unverified" | "disputed";

export interface SmartCheckResult {
  verdict: Verdict;
  // One line under the verdict, e.g. "Matches the nearby sensor."
  summary: string;
  items: CheckItem[];
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  likely: "Likely accurate",
  check: "Check before going",
  unverified: "Not verified yet",
  disputed: "Disputed",
};

// Shorter labels for the chip on feed cards.
export const VERDICT_SHORT: Record<Verdict, string> = {
  likely: "Likely accurate",
  check: "Check first",
  unverified: "Unverified",
  disputed: "Disputed",
};

export interface SmartCheckInput {
  report: Report;
  // Every report in the feed (the report itself is skipped).
  reports: Report[];
  sensors: Report[];
  // Confirmations, including the current user's own vote.
  confirms: number;
  isDisputed: (report: Report) => boolean;
  now?: Date;
}

const depth = (level: WaterLevel) => waterLevelLabel(level).toLowerCase();
const minutesBetween = (a: string, b: Date) =>
  (b.getTime() - new Date(a).getTime()) / 60_000;

interface SensorReadingNear {
  cm: number;
  // Unknown when the reading came with the report itself.
  distanceM?: number;
}

// The report's own sensor reading if it has one, otherwise the closest sensor.
export function nearestReading(
  report: Report,
  sensors: Report[],
): SensorReadingNear | null {
  if (report.sensorCm != null) return { cm: report.sensorCm };
  let best: SensorReadingNear | null = null;
  for (const s of sensors) {
    if (s.sensorCm == null) continue;
    const d = distanceMeters(report, s);
    if (d <= SENSOR_RADIUS_M && (best === null || d < (best.distanceM ?? Infinity))) {
      best = { cm: s.sensorCm, distanceM: d };
    }
  }
  return best;
}

function sensorCheck(report: Report, sensors: Report[]): CheckItem {
  const reading = nearestReading(report, sensors);
  if (!reading) {
    return {
      key: "sensor",
      status: "info",
      title: "No sensor nearby",
      detail: `No water sensor within ${SENSOR_RADIUS_M} m, so this relies on people's reports.`,
    };
  }
  const sensorLevel = levelForCm(reading.cm);
  const where =
    reading.distanceM != null
      ? `The sensor ${Math.round(reading.distanceM)} m away`
      : "The nearest sensor";
  const diff = LEVEL_RANK[sensorLevel] - LEVEL_RANK[report.waterLevel];
  if (diff === 0) {
    return {
      key: "sensor",
      status: "pass",
      title: "Sensor agrees",
      detail: `${where} reads ${reading.cm} cm, ${depth(sensorLevel)}, same as this report.`,
    };
  }
  return {
    key: "sensor",
    status: "warn",
    title: diff > 0 ? "Sensor reads deeper" : "Sensor reads lower",
    detail:
      `${where} reads ${reading.cm} cm, ${depth(sensorLevel)}. ` +
      `This report says ${depth(report.waterLevel)}` +
      (diff > 0 ? ", so the water may have risen." : ", so the water may be going down."),
  };
}

// Other people's reports about the same flood: close by, posted around the
// same time, same depth, and not disputed.
export function agreeingReports(
  report: Report,
  reports: Report[],
  isDisputed: (report: Report) => boolean,
): Report[] {
  const t = new Date(report.timestamp).getTime();
  return reports.filter(
    (o) =>
      o.id !== report.id &&
      o.source === "community" &&
      o.waterLevel === report.waterLevel &&
      !isDisputed(o) &&
      Math.abs(new Date(o.timestamp).getTime() - t) <= STALE_MINUTES * 60_000 &&
      distanceMeters(report, o) <= NEARBY_RADIUS_M,
  );
}

function crowdCheck(confirms: number, agreeing: number): CheckItem {
  const people =
    confirms > 0 ? `${confirms} ${confirms === 1 ? "person" : "people"} confirmed it` : "";
  const others =
    agreeing > 0
      ? `${agreeing} other ${agreeing === 1 ? "report" : "reports"} nearby ${agreeing === 1 ? "says" : "say"} the same`
      : "";
  if (confirms >= CROWD_CONFIRMS || agreeing > 0) {
    return {
      key: "crowd",
      status: "pass",
      title: "People agree",
      detail: `${[people, others].filter(Boolean).join(" · ")}.`,
    };
  }
  return {
    key: "crowd",
    status: "info",
    title: "Not confirmed yet",
    detail:
      confirms > 0
        ? `Only ${people} so far, and no other reports nearby.`
        : "No one has confirmed it yet, and there are no other reports nearby.",
  };
}

function freshCheck(report: Report, now: Date): CheckItem {
  const updated = report.editedAt ?? report.timestamp;
  const mins = minutesBetween(updated, now);
  const when = `${report.editedAt ? "Updated" : "Posted"} ${relativeTime(updated, now)}`;
  if (mins <= FRESH_MINUTES) {
    return { key: "fresh", status: "pass", title: "Recent", detail: `${when}.` };
  }
  if (mins <= STALE_MINUTES) {
    return {
      key: "fresh",
      status: "info",
      title: "A bit old",
      detail: `${when}. Water levels can change fast.`,
    };
  }
  return {
    key: "fresh",
    status: "warn",
    title: "May be outdated",
    detail: `${when}. Look for newer reports before going.`,
  };
}

// Adds the reused-photo result (worked out separately, since reading a photo
// takes a moment). A reused photo is reason enough to check before going.
export function withPhotoCheck(
  result: SmartCheckResult,
  photo: CheckItem | null,
): SmartCheckResult {
  if (!photo) return result;
  const items = [...result.items, photo];
  if (
    photo.status === "warn" &&
    (result.verdict === "likely" || result.verdict === "unverified")
  ) {
    return {
      verdict: "check",
      summary: "The photo was already posted on another report.",
      items,
    };
  }
  return { ...result, items };
}

export function smartCheck({
  report,
  reports,
  sensors,
  confirms,
  isDisputed,
  now = new Date(),
}: SmartCheckInput): SmartCheckResult {
  const sensor = sensorCheck(report, sensors);
  const crowd = crowdCheck(confirms, agreeingReports(report, reports, isDisputed).length);
  const fresh = freshCheck(report, now);
  const items = [sensor, crowd, fresh];

  if (isDisputed(report)) {
    return {
      verdict: "disputed",
      summary: "Several people flagged this report as fake or wrong.",
      items,
    };
  }
  if (sensor.status === "warn") {
    return {
      verdict: "check",
      summary: "The nearby sensor doesn't match this report.",
      items,
    };
  }
  if (fresh.status === "warn") {
    return { verdict: "check", summary: "This report may be outdated.", items };
  }
  if (sensor.status === "pass" || crowd.status === "pass") {
    const summary =
      sensor.status === "pass" && crowd.status === "pass"
        ? "Matches the nearby sensor and other people's reports."
        : sensor.status === "pass"
          ? "Matches the nearby sensor."
          : "Other people back this report up.";
    return { verdict: "likely", summary, items };
  }
  return {
    verdict: "unverified",
    summary: "Nothing confirms or contradicts it yet. Be careful.",
    items,
  };
}
