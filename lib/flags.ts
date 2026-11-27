// Flagging a report as fake or wrong. People pick one reason; once enough
// people flag the same report it's marked "Disputed": labeled, faded on the
// map, and left out of the "near you" counts.

export type FlagReason = "no-flood" | "wrong-place" | "fake-photo" | "outdated" | "spam";

export const FLAG_REASONS: { key: FlagReason; label: string; hint: string }[] = [
  { key: "no-flood", label: "No flood here", hint: "Or the water is much lower than reported" },
  { key: "wrong-place", label: "Wrong location", hint: "The flood is on a different street" },
  { key: "fake-photo", label: "Fake or reused photo", hint: "The photo isn't from here or now" },
  { key: "outdated", label: "Old, already cleared", hint: "It was true earlier but not anymore" },
  { key: "spam", label: "Spam or offensive", hint: "Not a real flood report" },
];

export function flagReasonLabel(key: FlagReason): string {
  return FLAG_REASONS.find((r) => r.key === key)?.label ?? key;
}

// Flags needed before a report is marked Disputed.
export const DISPUTED_AT = 3;

export function isDisputedCount(flags: number): boolean {
  return flags >= DISPUTED_AT;
}
