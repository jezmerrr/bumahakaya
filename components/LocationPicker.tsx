"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { distanceMeters, type LatLng } from "@/lib/geo";
import { Sheet } from "./Sheet";
import { formatDistance } from "./ui";

export const DLSU_CENTER: LatLng = { lat: 14.5647, lng: 120.9936 };

// Leaflet needs the browser, so the map loads on the client only.
const PinPickerMap = dynamic(() => import("./PinPickerMap"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center text-sm text-ink/65">
      Loading map…
    </div>
  ),
});

export function describePin(pin: LatLng): string {
  return `${formatDistance(distanceMeters(DLSU_CENTER, pin))} from DLSU`;
}

// Full-screen map for placing a report's pin. Nothing changes until
// "Use this spot" is pressed.
export function LocationPickerSheet({
  initial,
  onPick,
  onClose,
}: {
  initial: LatLng | null;
  onPick: (pin: LatLng) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<LatLng | null>(initial);

  return (
    <Sheet title="Pick the flooded spot" onClose={onClose}>
      <p className="text-sm text-ink/70">
        Tap the map where the flooding is. Drag the pin to adjust.
      </p>
      <div className="relative mt-3 h-[55vh] overflow-hidden rounded-3xl shadow-sm">
        {/* `isolate` keeps Leaflet's z-indexes inside this box */}
        <div className="absolute inset-0 isolate">
          <PinPickerMap value={draft} center={DLSU_CENTER} onChange={setDraft} />
        </div>
      </div>
      <p role="status" className="mt-3 text-sm text-ink/70">
        {draft ? `Pin set · ${describePin(draft)}` : "No pin yet"}
      </p>
      <button
        type="button"
        disabled={!draft}
        onClick={() => draft && onPick(draft)}
        className="mt-3 w-full rounded-2xl bg-signal py-3.5 text-base font-semibold text-white disabled:opacity-40"
      >
        Use this spot
      </button>
      <button
        type="button"
        onClick={onClose}
        className="mt-2 w-full rounded-2xl py-3 text-sm font-semibold text-ink/70"
      >
        Cancel
      </button>
    </Sheet>
  );
}
