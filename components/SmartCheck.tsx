"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { findReusedPhoto, type PhotoCandidate } from "@/lib/photoCheck";
import { severityColor, severityInk } from "@/lib/severity";
import {
  smartCheck,
  VERDICT_LABEL,
  VERDICT_SHORT,
  withPhotoCheck,
  type CheckItem,
  type CheckStatus,
  type SmartCheckResult,
  type Verdict,
} from "@/lib/smartCheck";
import { useStore } from "@/lib/store";
import type { Report } from "@/lib/types";
import { AlertIcon, CheckCircleIcon, InfoIcon, SparkleIcon } from "./icons";

// Smart check on screen: the panel on a report's details page, the chip on
// feed cards, and the reused-photo note in the report form. The checks
// themselves live in lib/smartCheck.ts and lib/photoCheck.ts.

type PhotoState = "checking" | "original" | "unknown" | { reusedFrom: string };

// Is this photo already on another post? null when there's no photo.
export function usePhotoCheck(
  photoUrl: string | undefined,
  // Keep this array stable (useMemo), or the check restarts every render.
  candidates: PhotoCandidate[],
): PhotoState | null {
  const [result, setResult] = useState<{ url: string; state: PhotoState } | null>(
    null,
  );
  useEffect(() => {
    if (!photoUrl) return;
    let cancelled = false;
    findReusedPhoto(photoUrl, candidates).then((match) => {
      if (cancelled) return;
      setResult({
        url: photoUrl,
        state:
          match === undefined
            ? "unknown"
            : match === null
              ? "original"
              : { reusedFrom: match.title },
      });
    });
    return () => {
      cancelled = true;
    };
  }, [photoUrl, candidates]);
  if (!photoUrl) return null;
  return result?.url === photoUrl ? result.state : "checking";
}

// Every other post's photo, for the reused-photo check.
export function usePhotoCandidates(excludeId?: string): PhotoCandidate[] {
  const { reports } = useStore();
  return useMemo(
    () =>
      reports.flatMap((r) =>
        r.id !== excludeId && r.photoUrl
          ? [{ id: r.id, title: r.headline ?? r.streetName, photoUrl: r.photoUrl }]
          : [],
      ),
    [reports, excludeId],
  );
}

function photoItem(state: PhotoState | null): CheckItem | null {
  if (state === null) return null;
  if (state === "checking") {
    return {
      key: "photo",
      status: "info",
      title: "Checking photo…",
      detail: "Comparing it with photos already posted.",
    };
  }
  if (state === "original") {
    return {
      key: "photo",
      status: "pass",
      title: "Photo looks original",
      detail: "It doesn't match any photo already posted.",
    };
  }
  if (state === "unknown") {
    return {
      key: "photo",
      status: "info",
      title: "Couldn't check the photo",
      detail: "This phone couldn't read the photo.",
    };
  }
  return {
    key: "photo",
    status: "warn",
    title: "Photo already posted",
    detail: `Same photo as "${state.reusedFrom}". It may not be from here or now.`,
  };
}

// The full result for a community report, or null for sensors and official posts.
export function useSmartCheck(report: Report): SmartCheckResult | null {
  const { reports, sensors, confirmCount, isDisputed } = useStore();
  const candidates = usePhotoCandidates(report.id);
  const photo = usePhotoCheck(report.photoUrl, candidates);
  if (report.source !== "community") return null;
  const base = smartCheck({
    report,
    reports,
    sensors,
    confirms: confirmCount(report),
    isDisputed,
  });
  return withPhotoCheck(base, photoItem(photo));
}

// Colors for each verdict; "Not verified yet" stays neutral.
function verdictTone(verdict: Verdict): { tint: CSSProperties; ink?: string } {
  const severity =
    verdict === "likely" ? "Passable" : verdict === "check" ? "Caution" : verdict === "disputed" ? "Impassable" : null;
  if (!severity) return { tint: {} };
  return {
    tint: { backgroundColor: `${severityColor(severity)}1a` },
    ink: severityInk(severity),
  };
}

function StatusIcon({ status }: { status: CheckStatus }) {
  const cls = "mt-0.5 h-4 w-4 shrink-0";
  if (status === "pass") {
    return (
      <CheckCircleIcon
        aria-hidden="true"
        className={cls}
        style={{ color: severityInk("Passable") }}
      />
    );
  }
  if (status === "warn") {
    return (
      <AlertIcon
        aria-hidden="true"
        className={cls}
        style={{ color: severityInk("Caution") }}
      />
    );
  }
  return <InfoIcon aria-hidden="true" className={`${cls} text-ink/50`} />;
}

// The Smart check section on a report's details page.
export function SmartCheckPanel({ report }: { report: Report }) {
  const result = useSmartCheck(report);
  if (!result) return null;
  const tone = verdictTone(result.verdict);
  const VerdictIcon =
    result.verdict === "likely"
      ? CheckCircleIcon
      : result.verdict === "unverified"
        ? InfoIcon
        : AlertIcon;

  return (
    <section
      aria-label="Smart check"
      data-testid="smart-check"
      data-verdict={result.verdict}
      className="rounded-3xl bg-surface p-4 shadow-sm"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink/65">
          <SparkleIcon aria-hidden="true" className="h-4 w-4 text-signal" />
          Smart check
        </h3>
        <span className="rounded-full border border-ink/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink/70">
          AI preview
        </span>
      </div>

      <div
        className={`mt-3 flex items-start gap-3 rounded-2xl px-3 py-3 ${tone.ink ? "" : "bg-ink/5"}`}
        style={tone.tint}
      >
        <VerdictIcon
          aria-hidden="true"
          className={`mt-0.5 h-5 w-5 shrink-0 ${tone.ink ? "" : "text-ink/60"}`}
          style={tone.ink ? { color: tone.ink } : undefined}
        />
        <div className="min-w-0">
          <p
            className="font-display text-base font-extrabold leading-snug text-ink"
            style={tone.ink ? { color: tone.ink } : undefined}
          >
            {VERDICT_LABEL[result.verdict]}
          </p>
          <p className="mt-0.5 text-xs text-ink/70">{result.summary}</p>
        </div>
      </div>

      <ul className="mt-3 space-y-2.5">
        {result.items.map((item) => (
          <li key={item.key} className="flex gap-2.5">
            <StatusIcon status={item.status} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">{item.title}</p>
              <p className="text-xs leading-relaxed text-ink/65">{item.detail}</p>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-3 border-t border-ink/10 pt-2.5 text-[11px] leading-relaxed text-ink/60">
        Demo version: these checks run on your phone, so they&apos;re free and
        nothing is sent anywhere. In the pilot, an AI model takes over and also
        reads the words in each post.
      </p>
    </section>
  );
}

// Small verdict chip on a feed card. Disputed posts already show a warning.
export function SmartCheckChip({ report }: { report: Report }) {
  const result = useSmartCheck(report);
  if (!result || result.verdict === "disputed") return null;
  const tone = verdictTone(result.verdict);
  return (
    <span
      data-testid="smart-check-chip"
      title={`Smart check: ${result.summary}`}
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${
        tone.ink ? "" : "bg-ink/5 text-ink/70"
      }`}
      style={tone.ink ? { ...tone.tint, color: tone.ink } : undefined}
    >
      <SparkleIcon aria-hidden="true" className="h-3 w-3" />
      <span className="sr-only">Smart check: </span>
      {VERDICT_SHORT[result.verdict]}
    </span>
  );
}

// Under a photo just picked in the report form.
export function PhotoCheckNote({
  photoUrl,
  candidates,
}: {
  photoUrl: string;
  candidates: PhotoCandidate[];
}) {
  const state = usePhotoCheck(photoUrl, candidates);
  if (state === null || state === "unknown") return null;
  if (typeof state === "object") {
    return (
      <p
        aria-live="polite"
        data-testid="photo-check"
        className="mt-2 flex items-start gap-2 rounded-2xl border border-amber/40 bg-notice px-3 py-2 text-xs text-ink/80"
      >
        <AlertIcon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-amber-ink" />
        <span>
          <strong className="font-semibold text-ink">Smart check:</strong> this
          photo looks the same as one already posted (&ldquo;{state.reusedFrom}
          &rdquo;). Please only post photos you took yourself.
        </span>
      </p>
    );
  }
  return (
    <p
      aria-live="polite"
      data-testid="photo-check"
      className="mt-2 flex items-center gap-1.5 text-xs text-ink/65"
    >
      <SparkleIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-signal" />
      {state === "checking"
        ? "Smart check: comparing your photo with posted ones…"
        : "Smart check: photo looks original."}
    </p>
  );
}
