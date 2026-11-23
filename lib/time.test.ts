import { describe, expect, it } from "vitest";
import { relativeTime } from "./time";

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
