import { describe, expect, it } from "vitest";
import { DISPUTED_AT, FLAG_REASONS, flagReasonLabel, isDisputedCount } from "./flags";

describe("flags", () => {
  it("marks a report Disputed once enough people flag it", () => {
    expect(DISPUTED_AT).toBe(3);
    expect(isDisputedCount(2)).toBe(false);
    expect(isDisputedCount(3)).toBe(true);
  });

  it("has a label for every reason", () => {
    for (const r of FLAG_REASONS) expect(flagReasonLabel(r.key)).toBe(r.label);
  });
});
