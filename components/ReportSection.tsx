"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, type FormEvent } from "react";
import { useStore } from "@/lib/store";
import { severityColor } from "@/lib/severity";
import type { LatLng } from "@/lib/geo";
import type { Severity, WaterLevel } from "@/lib/types";
import { CURRENT_USER } from "@/lib/user";

const DLSU_CENTER: LatLng = { lat: 14.5647, lng: 120.9936 };

const WATER_LEVEL: Record<Severity, WaterLevel> = {
  Passable: "Ankle",
  Caution: "Knee",
  Impassable: "Waist+",
};

const OPTIONS: { severity: Severity; label: string }[] = [
  { severity: "Passable", label: "Passable" },
  { severity: "Caution", label: "Gutter-deep" },
  { severity: "Impassable", label: "Not passable" },
];

export function ReportSection({ onPosted }: { onPosted?: () => void }) {
  const { addReport } = useStore();
  const [location, setLocation] = useState("");
  const [severity, setSeverity] = useState<Severity>("Caution");
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPhotoUrl(file ? URL.createObjectURL(file) : undefined);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    addReport({
      lat: DLSU_CENTER.lat,
      lng: DLSU_CENTER.lng,
      streetName: location.trim() || "Unnamed street near DLSU",
      headline: location.trim() || "Flood report near DLSU",
      severity,
      waterLevel: WATER_LEVEL[severity],
      passable: severity !== "Impassable",
      photoUrl,
      author: CURRENT_USER.handle,
      confirms: 0,
      comments: 0,
    });
    setLocation("");
    setPhotoUrl(undefined);
    setSeverity("Caution");
    onPosted?.();
  }

  return (
    <form onSubmit={onSubmit} className="px-4 pb-4 pt-4">
      <h1 className="font-display text-2xl font-extrabold text-navy">
        Report flooding
      </h1>
      <p className="text-sm text-navy/50">Help your neighbors stay safe</p>

      <label
        htmlFor="location"
        className="mt-6 block text-xs font-semibold uppercase tracking-wide text-navy/50"
      >
        Location
      </label>
      <input
        id="location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="e.g. Taft Ave cor. Estrada"
        className="mt-2 w-full rounded-2xl border border-navy/15 bg-white px-4 py-3 text-sm"
      />

      <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-navy/50">
        Water level
      </p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {OPTIONS.map((o) => {
          const active = o.severity === severity;
          const color = severityColor(o.severity);
          return (
            <button
              key={o.severity}
              type="button"
              onClick={() => setSeverity(o.severity)}
              aria-pressed={active}
              style={
                active
                  ? { backgroundColor: color, color: "#fff" }
                  : { backgroundColor: `${color}1a`, color }
              }
              className="rounded-2xl py-3 text-sm font-semibold"
            >
              {o.label}
            </button>
          );
        })}
      </div>

      <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-navy/50">
        Photo
      </p>
      <label
        htmlFor="photo"
        className="mt-2 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-navy/20 bg-white/50 text-sm text-navy/50"
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="Selected flood photo"
            className="h-24 w-full rounded-xl object-cover"
          />
        ) : (
          <span>+ Tap to add a photo</span>
        )}
        <input
          id="photo"
          type="file"
          accept="image/*"
          onChange={onPhoto}
          className="hidden"
        />
      </label>

      <button
        type="submit"
        className="mt-6 w-full rounded-2xl bg-signal py-4 text-base font-semibold text-white"
      >
        Post report
      </button>
    </form>
  );
}
