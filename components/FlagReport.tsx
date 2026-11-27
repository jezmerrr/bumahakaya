"use client";

import { useState } from "react";
import { DISPUTED_AT, FLAG_REASONS, flagReasonLabel, type FlagReason } from "@/lib/flags";
import { useStore } from "@/lib/store";
import type { Report } from "@/lib/types";
import { AlertIcon } from "./icons";
import { BottomSheet } from "./Sheet";

// "Why is this wrong?" sheet. Also lets you change your reason or undo.
export function FlagSheet({
  report,
  onClose,
}: {
  report: Report;
  onClose: () => void;
}) {
  const { myFlag, flagReport, unflagReport, flagCount } = useStore();
  const current = myFlag(report.id);
  const [reason, setReason] = useState<FlagReason | null>(current);
  const [done, setDone] = useState(false);

  if (done) {
    // flagCount already includes the flag just added.
    const needed = Math.max(0, DISPUTED_AT - flagCount(report));
    return (
      <BottomSheet title="Thanks for flagging" onClose={onClose}>
        <p className="text-sm text-ink/70">
          {needed === 0 ? (
            <>
              This post is marked <strong className="text-ink">Disputed</strong>{" "}
              and no longer counts toward the flood alerts near you.
            </>
          ) : (
            <>
              If {needed === 1 ? "1 more person flags" : `${needed} more people flag`}{" "}
              it, it&apos;s marked <strong className="text-ink">Disputed</strong> and
              stops counting toward the flood alerts near you.
            </>
          )}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-2xl bg-signal py-3 text-sm font-semibold text-white"
        >
          Done
        </button>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet title="What's wrong with this post?" onClose={onClose}>
      <p className="text-sm text-ink/70">
        Flag posts that are fake or wrong so others don&apos;t rely on them.
      </p>
      <fieldset className="mt-3">
        <legend className="sr-only">Reason</legend>
        <div className="space-y-2">
          {FLAG_REASONS.map((r) => (
            <label
              key={r.key}
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 ${
                reason === r.key ? "border-signal bg-signal/5" : "border-ink/10"
              }`}
            >
              <input
                type="radio"
                name="flag-reason"
                value={r.key}
                checked={reason === r.key}
                onChange={() => setReason(r.key)}
                className="mt-1 accent-[#1e6fd9]"
              />
              <span>
                <span className="block text-sm font-semibold text-ink">{r.label}</span>
                <span className="block text-xs text-ink/65">{r.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <button
        type="button"
        disabled={!reason}
        onClick={() => {
          if (!reason) return;
          flagReport(report.id, reason);
          setDone(true);
        }}
        className="mt-4 w-full rounded-2xl bg-impass py-3 text-sm font-semibold text-white disabled:opacity-40"
      >
        {current ? "Update flag" : "Flag post"}
      </button>
      {current ? (
        <button
          type="button"
          onClick={() => {
            unflagReport(report.id);
            onClose();
          }}
          className="mt-2 w-full rounded-2xl py-3 text-sm font-semibold text-ink/70"
        >
          Remove my flag
        </button>
      ) : null}
    </BottomSheet>
  );
}

// Warning shown on a disputed post (card and details page).
export function DisputedNotice({ report }: { report: Report }) {
  const { flagCount, myFlag } = useStore();
  const n = flagCount(report);
  const mine = myFlag(report.id);
  return (
    <p
      role="note"
      className="flex items-start gap-2 rounded-2xl border border-amber/40 bg-notice px-3 py-2 text-xs text-ink/80"
    >
      <AlertIcon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-amber-ink" />
      <span>
        <strong className="font-semibold text-ink">Disputed</strong> · {n} people flagged
        this as fake or wrong{mine ? ` (you: ${flagReasonLabel(mine).toLowerCase()})` : ""}.
        Not counted in flood alerts.
      </span>
    </p>
  );
}
