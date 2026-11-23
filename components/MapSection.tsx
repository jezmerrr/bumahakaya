"use client";

import dynamic from "next/dynamic";
import { useStore } from "@/lib/store";
import { reportsNearby, type LatLng } from "@/lib/geo";
import { severityColor, severityShort } from "@/lib/severity";
import { relativeTime } from "@/lib/time";
import type { Severity, WaterLevel } from "@/lib/types";

const DLSU_CENTER: LatLng = { lat: 14.5647, lng: 120.9936 };

const DEPTH: Record<WaterLevel, string> = {
  Ankle: "ankle-deep",
  Knee: "knee-deep",
  "Waist+": "waist-deep",
};

const LEGEND: { severity: Severity; label: string }[] = [
  { severity: "Passable", label: "Passable" },
  { severity: "Caution", label: "Gutter-deep" },
  { severity: "Impassable", label: "Not passable" },
];

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center text-sm text-navy/50">
      Loading map…
    </div>
  ),
});

export function MapSection() {
  const { reports, sensors } = useStore();
  const markers = [...reports, ...sensors];
  const nearby = reportsNearby(DLSU_CENTER, markers, 700)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, 5);

  return (
    <div>
      <div className="px-4 pt-4">
        <h1 className="font-display text-2xl font-extrabold text-navy">
          Flood map
        </h1>
        <p className="text-sm text-navy/50">Taft Avenue, Manila · Just now</p>
      </div>

      <div className="relative mt-3 h-[50vh] w-full">
        <MapView center={DLSU_CENTER} markers={markers} />
        <div className="pointer-events-none absolute right-3 top-3 z-[500] rounded-2xl bg-white/95 p-3 text-xs shadow-md">
          <p className="mb-1.5 font-display font-extrabold text-navy">
            Road status
          </p>
          <ul className="space-y-1">
            {LEGEND.map((l) => (
              <li key={l.severity} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: severityColor(l.severity) }}
                />
                <span className="text-navy/70">{l.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="px-4 py-4">
        <h2 className="font-display text-lg font-extrabold text-navy">
          {nearby.length} reports near you
        </h2>
        <ul className="mt-2 space-y-3">
          {nearby.map((r) => (
            <li key={r.id} className="flex items-start gap-2">
              <span
                className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: severityColor(r.severity) }}
              />
              <div>
                <p className="text-sm font-semibold text-navy">
                  {r.streetName}
                </p>
                <p className="text-xs text-navy/50">
                  {severityShort(r.severity)} · {DEPTH[r.waterLevel]} ·{" "}
                  {relativeTime(r.timestamp)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
