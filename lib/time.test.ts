import { describe, expect, it } from "vitest";
import { formatDateTime, relativeTime } from "./time";

const now = new Date("2026-11-24T16:12:00+08:00");

function ago(ms: number): string {
  return new Date(now.getTime() - ms).toISOString();
}

describe("relativeTime", () => {
  it("says 'just now' under 45 seconds", () => {
    expect(relativeTime(ago(10_000), now)).toBe("just now");
  });

  it("counts minutes", () => {
    expect(relativeTime(ago(5 * 60_000), now)).toBe("5m ago");
  });

  it("counts hours", () => {
    expect(relativeTime(ago(90 * 60_000), now)).toBe("1h ago");
  });
});

describe("formatDateTime", () => {
  it("shows the posting time in Manila time", () => {
    // 16:30 UTC is 12:30 AM the next day in Manila (UTC+8).
    expect(formatDateTime("2026-11-27T16:30:00Z")).toMatch(
      /Nov 28,? 12:30\s?AM/i,
    );
  });
});
