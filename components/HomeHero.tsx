"use client";

import dynamic from "next/dynamic";
import type { LatLng } from "@/lib/geo";
import type { AreaStatus, NearbySummary } from "@/lib/mapSummary";
import {
  severityColor,
  severityInk,
  severityShort,
  waterLevelLabel,
} from "@/lib/severity";
import { greeting, relativeTime } from "@/lib/time";
import type { Report, Severity } from "@/lib/types";
import { CURRENT_USER } from "@/lib/user";
import { AlertIcon, CheckCircleIcon } from "./icons";
import { formatDistance } from "./ui";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-white/60" />,
});

// Sky behind the status card: the worse it is nearby, the warmer the sky.
const SKY: Record<Severity, string> = {
  Passable: "linear-gradient(180deg, #8fd3f2 0%, #d9f0fb 55%, #ffffff 100%)",
  Caution: "linear-gradient(180deg, #f6cf8f 0%, #fcebd0 55%, #ffffff 100%)",
  Impassable: "linear-gradient(180deg, #f2a7a7 0%, #fbe0e0 55%, #ffffff 100%)",
};

// Words after the big number, e.g. "4 roads not passable".
const HEADLINE: Record<Severity, (n: number) => string> = {
  Impassable: (n) => (n === 1 ? "road not passable" : "roads not passable"),
  Caution: (n) => (n === 1 ? "road needs caution" : "roads need caution"),
  Passable: () => "All clear near you",
};

const GLASS =
  "border border-white/70 bg-white/75 shadow-[0_8px_30px_rgba(11,37,69,0.10)] backdrop-blur-xl";

// The first thing on Home: is it safe around me right now?
// Layout, top to bottom: greeting + freshness, headline, the one street to
// avoid, mini map, three quick stats.
export function HomeHero({
  status,
  summary,
  markers,
  center,
  updatedAt,
  onShow,
  onOpenMap,
}: {
  status: AreaStatus;
  summary: NearbySummary | null;
  markers: Report[];
  center: LatLng;
  updatedAt: string | null;
  onShow: (severity: Severity) => void;
  onOpenMap?: () => void;
}) {
  const firstName = CURRENT_USER.name.split(" ")[0];
  const clear = status.severity === "Passable";
  const worst = status.worst;
  const ink = severityInk(status.severity);
  const label = severityShort(status.severity).toLowerCase();

  return (
    <section
      aria-label="Flood status near you"
      data-status={status.severity}
      className="overflow-hidden rounded-3xl p-4 shadow-sm"
      style={{ background: SKY[status.severity] }}
    >
      {/* 1. Greeting + how fresh the data is */}
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-sm font-semibold text-navy/70">
          {greeting()}, {firstName}
        </p>
        {updatedAt ? (
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-navy/70 ${GLASS}`}
          >
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-pass" />
            Updated {relativeTime(updatedAt)}
          </span>
        ) : null}
      </div>

      {/* 2. Headline */}
      <h1 className="mt-3 flex items-baseline gap-2 text-navy">
        {clear ? null : (
          <>
            <span className="font-display text-5xl font-extrabold leading-none">
              {status.count}
            </span>{" "}
            {/* the space keeps screen readers from saying "4roads" */}
          </>
        )}
        <span className="font-display text-xl font-extrabold leading-tight">
          {HEADLINE[status.severity](status.count)}
        </span>
      </h1>
      <p className="mt-1 text-sm text-navy/70">
        {clear
          ? "Walang baha na naiulat malapit sa'yo."
          : `Near you · ${plural(status.reports, "report")} · ${plural(
              status.sensors,
              "sensor",
            )}`}
      </p>

      {/* 3. The one street to avoid (or an all-clear note) */}
      <div className={`mt-3 flex items-center gap-3 rounded-2xl p-3 ${GLASS}`}>
        <span
          aria-hidden="true"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
          style={{
            backgroundColor: `${severityColor(status.severity)}1f`,
            color: ink,
          }}
        >
          {clear ? (
            <CheckCircleIcon className="h-5 w-5" />
          ) : (
            <AlertIcon className="h-5 w-5" />
          )}
        </span>
        {clear || !worst ? (
          <p className="min-w-0 flex-1 text-sm text-navy/70">
            Madadaanan ang mga daan malapit sa&apos;yo. Ingat pa rin.
          </p>
        ) : (
          <>
            <div className="min-w-0 flex-1">
              <p
                className="text-[11px] font-bold uppercase tracking-wide"
                style={{ color: ink }}
              >
                Iwasan muna
              </p>
              <p className="line-clamp-2 text-sm font-bold leading-snug text-navy">
                {worst.report.headline ?? worst.report.streetName}
              </p>
              <p className="text-xs text-navy/65">
                {waterLevelLabel(worst.report.waterLevel)} ·{" "}
                {formatDistance(worst.distanceM)} away
              </p>
            </div>
            <button
              type="button"
              onClick={() => onShow(status.severity)}
              aria-label={`See all ${label} reports`}
              className="shrink-0 rounded-full bg-navy px-3 py-1.5 text-xs font-semibold text-white"
            >
              See all ›
            </button>
          </>
        )}
      </div>

      {/* 4. Mini map preview; tapping it opens the Maps tab */}
      <div className="relative mt-3 h-28 overflow-hidden rounded-2xl border border-white/70 shadow-sm">
        {/* `isolate` keeps Leaflet's z-indexes under the tap target */}
        <div className="absolute inset-0 isolate">
          <MapView center={center} markers={markers} zoom={15} interactive={false} />
        </div>
        <button
          type="button"
          onClick={onOpenMap}
          aria-label="Open flood map"
          className="absolute inset-0 z-10 flex items-end justify-end p-2"
        >
          <span className={`rounded-full px-3 py-1 text-xs font-semibold text-navy ${GLASS}`}>
            Open map ›
          </span>
        </button>
      </div>

      {/* 5. Quick stats */}
      <dl className={`mt-3 grid grid-cols-3 divide-x divide-navy/10 rounded-2xl py-3 ${GLASS}`}>
        <Stat label="Reports nearby" value={String(summary?.count ?? 0)} />
        <Stat
          label="Deepest"
          value={summary ? waterLevelLabel(summary.deepest.report.waterLevel) : "None"}
        />
        <Stat
          label="Closest"
          value={summary ? formatDistance(summary.closest.distanceM) : "None"}
        />
      </dl>
    </section>
  );
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 px-3">
      <dt className="truncate text-[11px] text-navy/65">{label}</dt>
      <dd className="truncate text-sm font-semibold text-navy">{value}</dd>
    </div>
  );
}
