"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { Map as LeafletMap } from "leaflet";
import { useStore } from "@/lib/store";
import type { LatLng } from "@/lib/geo";
import {
  countBySeverity,
  nearbyItems,
  newestTimestamp,
  summarize,
  type NearbyItem,
} from "@/lib/mapSummary";
import {
  severityColor,
  severityFill,
  severityInk,
  severityShort,
  waterLevelLabel,
} from "@/lib/severity";
import { relativeTime } from "@/lib/time";
import type { Report, Severity } from "@/lib/types";
import {
  ListIcon,
  LocateIcon,
  MapIcon,
  MinusIcon,
  PlusIcon,
  UserIcon,
  WavesIcon,
  XIcon,
} from "./icons";
import { ReportDetailPage } from "./ReportDetail";
import { formatDistance, StatusPill } from "./ui";

const DLSU_CENTER: LatLng = { lat: 14.5647, lng: 120.9936 };
const RADIUS_M = 700;

// Worst first, same order as the Home filter.
const CONDITIONS: Severity[] = ["Impassable", "Caution", "Passable"];

// Frosted-glass panels floating over the map.
const GLASS =
  "border border-edge bg-surface/80 shadow-[0_8px_30px_rgba(11,37,69,0.14)] backdrop-blur-xl";
// Smaller shadow for chips, so the scrolling row doesn't clip it into a band.
const GLASS_CHIP =
  "border border-edge bg-surface/85 shadow-[0_2px_8px_rgba(11,37,69,0.12)] backdrop-blur-xl";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-surface text-sm text-ink/65">
      Loading map…
    </div>
  ),
});

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

export function MapSection({
  focusId = null,
}: {
  // Open with this report/sensor selected and zoomed in ("Show on map").
  focusId?: string | null;
}) {
  const { reports, sensors, isDisputed } = useStore();
  const [view, setView] = useState<"map" | "list">("map");
  const [severity, setSeverity] = useState<Severity | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(focusId);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [map, setMap] = useState<LeafletMap | null>(null);

  const all = useMemo(() => [...reports, ...sensors], [reports, sensors]);
  const shown = useMemo(
    () => (severity ? all.filter((m) => m.severity === severity) : all),
    [all, severity],
  );
  const nearby = useMemo(
    () => nearbyItems(all, DLSU_CENTER, RADIUS_M, severity),
    [all, severity],
  );
  // Disputed reports stay on the map (faded) but don't count in the summary.
  const summary = summarize(nearby.filter((i) => !isDisputed(i.report)));
  const disputedIds = useMemo(
    () => new Set(all.filter((m) => isDisputed(m)).map((m) => m.id)),
    [all, isDisputed],
  );
  const counts = countBySeverity(all);
  const newest = newestTimestamp(all);

  // A filter can hide the selected pin; then nothing is selected.
  const selected = shown.find((m) => m.id === selectedId) ?? null;
  const detail = all.find((m) => m.id === detailId) ?? null;
  const distanceTo = (id: string) =>
    nearby.find((i) => i.report.id === id)?.distanceM;

  function select(id: string | null) {
    setSelectedId(id);
    const m = id ? all.find((x) => x.id === id) : null;
    if (m && map) {
      const zoom = Math.max(map.getZoom(), 17);
      // Aim a bit below the pin so it lands in the open map above the card.
      const target = map.unproject(
        map.project([m.lat, m.lng], zoom).add([0, map.getSize().y * 0.18]),
        zoom,
      );
      map.flyTo(target, zoom, {
        animate: !prefersReducedMotion(),
        duration: 0.6,
      });
    }
  }

  function recenter() {
    setSelectedId(null);
    map?.flyTo([DLSU_CENTER.lat, DLSU_CENTER.lng], 16, {
      animate: !prefersReducedMotion(),
    });
  }

  function showOnMap(item: NearbyItem) {
    setView("map");
    select(item.report.id);
  }

  return (
    <div className="absolute inset-0 isolate overflow-hidden">
      {view === "map" ? (
        // `isolate` keeps Leaflet's own z-indexes under the floating panels.
        <div className="absolute inset-0 isolate">
          <MapView
            // Only read when the map appears: open on the selected report
            // (from "Show on map" or the list), otherwise on DLSU.
            center={selected ? { lat: selected.lat, lng: selected.lng } : DLSU_CENTER}
            zoom={selected ? 17 : 16}
            markers={shown}
            fadedIds={disputedIds}
            selectedId={selected?.id ?? null}
            onSelect={select}
            onMap={setMap}
          />
        </div>
      ) : (
        <>
          <NearbyList
            items={nearby}
            severity={severity}
            onOpen={(id) => setDetailId(id)}
          />
          {/* Fade the list out behind the floating Map/List switch */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-linear-to-t from-mist via-mist/90 to-transparent" />
        </>
      )}

      {/* Title + road-condition chips */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 space-y-2 p-3">
        <div className={`pointer-events-auto inline-block rounded-2xl px-4 py-2.5 ${GLASS}`}>
          <h1 className="font-display text-lg font-extrabold leading-tight text-ink">
            Flood map
          </h1>
          <p className="text-xs text-ink/70">
            Near DLSU-Manila
            {newest ? ` · Updated ${relativeTime(newest)}` : ""}
          </p>
        </div>
        <div
          role="group"
          aria-label="Filter by road condition"
          className="pointer-events-auto -my-1 flex gap-1.5 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {CONDITIONS.map((s) => {
            const active = s === severity;
            const color = severityColor(s);
            const fill = severityFill(s);
            return (
              <button
                key={s}
                type="button"
                aria-pressed={active}
                onClick={() => setSeverity(active ? null : s)}
                style={active ? { backgroundColor: fill, borderColor: fill } : undefined}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-semibold ${
                  active ? "text-white shadow-md" : `text-ink/80 ${GLASS_CHIP}`
                }`}
              >
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: active ? "#fff" : color }}
                />
                {severityShort(s)}
                <span className={active ? "text-white/80" : "text-ink/65"}>
                  {counts[s]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Zoom and recenter */}
      {view === "map" ? (
        <div
          className={`absolute right-3 top-1/2 z-10 flex -translate-y-[70%] flex-col overflow-hidden rounded-2xl ${GLASS}`}
        >
          <ControlButton label="Zoom in" onClick={() => map?.zoomIn()}>
            <PlusIcon className="h-5 w-5" />
          </ControlButton>
          <span className="mx-2 border-t border-ink/10" />
          <ControlButton label="Zoom out" onClick={() => map?.zoomOut()}>
            <MinusIcon className="h-5 w-5" />
          </ControlButton>
          <span className="mx-2 border-t border-ink/10" />
          <ControlButton label="Back to my location" onClick={recenter}>
            <LocateIcon className="h-[18px] w-[18px]" />
          </ControlButton>
        </div>
      ) : null}

      {/* Map/List switch + summary or selected report. Sits above the
          bottom nav and its raised + button. */}
      <div className="absolute inset-x-3 bottom-24 z-10 flex flex-col items-center gap-2">
        <div
          role="group"
          aria-label="View"
          className={`flex rounded-full p-1 ${GLASS}`}
        >
          {(
            [
              ["map", "Map", MapIcon],
              ["list", "List", ListIcon],
            ] as const
          ).map(([key, label, Icon]) => {
            const active = view === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => setView(key)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                  active ? "bg-ink text-surface" : "text-ink/70"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>

        {view === "map" ? (
          selected ? (
            <SelectedCard
              report={selected}
              distanceM={distanceTo(selected.id)}
              onClose={() => select(null)}
              onOpen={() => setDetailId(selected.id)}
            />
          ) : (
            <SummaryCard
              summary={summary}
              severity={severity}
              onShow={showOnMap}
            />
          )
        ) : null}
      </div>

      {detail ? (
        <ReportDetailPage
          key={detail.id}
          report={detail}
          distanceM={distanceTo(detail.id)}
          onClose={() => setDetailId(null)}
          onShowOnMap={() => {
            setDetailId(null);
            setView("map");
            select(detail.id);
          }}
        />
      ) : null}
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid h-11 w-11 place-items-center text-ink/70 hover:bg-surface/60 active:bg-ink/5"
    >
      {children}
    </button>
  );
}

function SummaryCard({
  summary,
  severity,
  onShow,
}: {
  summary: ReturnType<typeof summarize>;
  severity: Severity | null;
  onShow: (item: NearbyItem) => void;
}) {
  const heading = severity
    ? `Marked ${severityShort(severity).toLowerCase()} within ${RADIUS_M} m`
    : `Reports within ${RADIUS_M} m`;
  return (
    <section aria-label="Nearby summary" className={`w-full rounded-3xl p-4 ${GLASS}`}>
      <p className="text-xs font-semibold text-ink/70">{heading}</p>
      <p className="font-display text-4xl font-extrabold leading-tight text-ink">
        {summary?.count ?? 0}
      </p>
      {summary ? (
        <div className="mt-2 grid grid-cols-3 gap-2">
          <Stat
            label="Closest"
            value={formatDistance(summary.closest.distanceM)}
            onClick={() => onShow(summary.closest)}
          />
          <Stat
            label="Deepest"
            value={waterLevelLabel(summary.deepest.report.waterLevel)}
            onClick={() => onShow(summary.deepest)}
          />
          <Stat
            label="Latest"
            value={relativeTime(summary.latest.report.timestamp)}
            onClick={() => onShow(summary.latest)}
          />
        </div>
      ) : (
        <p className="mt-1 text-sm text-ink/70">
          Walang reports dito ngayon. Try another filter.
        </p>
      )}
    </section>
  );
}

function Stat({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label}: ${value}. Show on map`}
      className="rounded-2xl bg-surface/60 px-2.5 py-2 text-left hover:bg-surface active:bg-ink/5"
    >
      <span className="block text-[11px] text-ink/70">{label}</span>
      <span className="block truncate text-sm font-semibold text-ink">
        {value}
      </span>
    </button>
  );
}

function SelectedCard({
  report,
  distanceM,
  onClose,
  onOpen,
}: {
  report: Report;
  distanceM?: number;
  onClose: () => void;
  onOpen: () => void;
}) {
  const sensor = report.source === "sensor";
  const color = severityColor(report.severity);
  const ink = severityInk(report.severity);
  const Icon = sensor ? WavesIcon : UserIcon;
  return (
    <section
      aria-label="Selected report"
      className={`w-full rounded-3xl p-4 ${GLASS}`}
    >
      <div className="flex items-start gap-3">
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
          style={{ backgroundColor: `${color}1f`, color: ink }}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/65">
            {sensor ? "FloodWatch sensor" : "Community report"} ·{" "}
            {relativeTime(report.timestamp)}
          </p>
          <h2 className="line-clamp-2 font-display text-base font-extrabold leading-snug text-ink">
            {report.headline ?? report.streetName}
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <StatusPill severity={report.severity} />
            <span className="text-xs text-ink/70">
              {waterLevelLabel(report.waterLevel)}
              {distanceM != null ? ` · ${formatDistance(distanceM)} away` : ""}
            </span>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close preview"
          onClick={onClose}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink/5 text-ink/70"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="mt-3 w-full rounded-2xl bg-signal py-3 text-sm font-semibold text-white"
      >
        View details
      </button>
    </section>
  );
}

function NearbyList({
  items,
  severity,
  onOpen,
}: {
  items: NearbyItem[];
  severity: Severity | null;
  onOpen: (id: string) => void;
}) {
  return (
    // Padding leaves room for the floating title/chips and bottom switch.
    <div className="absolute inset-0 overflow-y-auto bg-mist px-3 pb-40 pt-[124px]">
      <h2 className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-ink/65">
        {items.length} {severity ? severityShort(severity).toLowerCase() : ""}{" "}
        {items.length === 1 ? "report" : "reports"} within {RADIUS_M} m
      </h2>
      {items.length === 0 ? (
        <p className="rounded-3xl bg-surface p-6 text-center text-sm text-ink/70 shadow-sm">
          Walang reports dito ngayon. Try another filter.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map(({ report, distanceM }) => {
            const sensor = report.source === "sensor";
            const color = severityColor(report.severity);
            const ink = severityInk(report.severity);
            const Icon = sensor ? WavesIcon : UserIcon;
            return (
              <li key={report.id}>
                <button
                  type="button"
                  onClick={() => onOpen(report.id)}
                  className="flex w-full items-center gap-3 rounded-2xl bg-surface p-3 text-left shadow-sm active:bg-ink/5"
                >
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                    style={{ backgroundColor: `${color}1f`, color: ink }}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">
                      {report.headline ?? report.streetName}
                    </span>
                    <span className="block truncate text-xs text-ink/70">
                      {severityShort(report.severity)} ·{" "}
                      {waterLevelLabel(report.waterLevel)} ·{" "}
                      {formatDistance(distanceM)} · {relativeTime(report.timestamp)}
                    </span>
                  </span>
                  <span aria-hidden="true" className="text-ink/45">
                    ›
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
