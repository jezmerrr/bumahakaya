import { describe, expect, it } from "vitest";
import { alertCategory, groupAlerts, isNewAlert } from "./alerts";
import type { Announcement } from "./types";

const now = new Date("2026-11-28T12:00:00+08:00");
const ago = (m: number) => new Date(now.getTime() - m * 60_000).toISOString();

function alert(over: Partial<Announcement> & { id: string }): Announcement {
  return {
    title: "t",
    body: "b",
    agency: "Manila LGU",
    type: "advisory",
    source: "lgu",
    timestamp: ago(5),
    ...over,
  };
}

describe("alertCategory", () => {
  it("files alerts the way a student looks for them", () => {
    expect(alertCategory(alert({ id: "1", type: "suspension" }))).toBe("classes");
    expect(alertCategory(alert({ id: "2", source: "school" }))).toBe("classes");
    expect(alertCategory(alert({ id: "3", type: "closure" }))).toBe("roads");
    expect(alertCategory(alert({ id: "4", source: "sensor" }))).toBe("water");
    expect(alertCategory(alert({ id: "5", source: "weather" }))).toBe("weather");
    expect(alertCategory(alert({ id: "6" }))).toBe("advisory");
  });
});

describe("groupAlerts", () => {
  it("sorts newest first into last hour, earlier today, and older", () => {
    const groups = groupAlerts(
      [
        alert({ id: "old", timestamp: ago(3 * 24 * 60) }),
        alert({ id: "two-hours", timestamp: ago(120) }),
        alert({ id: "five-min", timestamp: ago(5) }),
        alert({ id: "forty-min", timestamp: ago(40) }),
      ],
      now,
    );
    expect(groups.map((g) => [g.label, g.items.map((a) => a.id)])).toEqual([
      ["Last hour", ["five-min", "forty-min"]],
      ["Earlier today", ["two-hours"]],
      ["Older", ["old"]],
    ]);
  });

  it("leaves out empty groups", () => {
    expect(groupAlerts([alert({ id: "x", timestamp: ago(90) })], now).map((g) => g.label)).toEqual([
      "Earlier today",
    ]);
  });
});

describe("isNewAlert", () => {
  it("marks alerts from the last 30 minutes as new", () => {
    expect(isNewAlert(alert({ id: "a", timestamp: ago(29) }), now)).toBe(true);
    expect(isNewAlert(alert({ id: "b", timestamp: ago(31) }), now)).toBe(false);
  });
});
