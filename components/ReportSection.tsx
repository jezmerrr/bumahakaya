
"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, type FormEvent } from "react";
import { useStore } from "@/lib/store";
import { severityColor } from "@/lib/severity";
import type { LatLng } from "@/lib/geo";
import type { Severity, WaterLevel } from "@/lib/types";
import { CURRENT_USER } from "@/lib/user";

const DLSU_CENTER: LatLng = { lat: 14.5647, lng: 120.9936 };

const WATER_LEVELS: WaterLevel[] = ["Ankle", "Knee", "Waist+"];

function suggestRoadCondition(level: WaterLevel): Severity {
  switch (level) {
    case "Ankle":
      return "Passable";
    case "Knee":
      return "Caution";
    case "Waist+":
      return "Impassable";
  }
}

const ROAD_OPTIONS: {
  severity: Severity;
  label: string;
}[] = [
  { severity: "Passable", label: "Passable" },
  { severity: "Caution", label: "Difficult" },
  { severity: "Impassable", label: "Not passable" },
];

export function ReportSection({ onPosted }: { onPosted?: () => void }) {
  const { addReport } = useStore();

  const [location, setLocation] = useState("");
  const [waterLevel, setWaterLevel] = useState<WaterLevel>("Ankle");
  const [severity, setSeverity] = useState<Severity>(
    suggestRoadCondition("Ankle")
  );
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPhotoUrl(file ? URL.createObjectURL(file) : undefined);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();

    if (!location.trim()) return;

    addReport({
      lat: DLSU_CENTER.lat,
      lng: DLSU_CENTER.lng,
      streetName: location.trim(),
      headline: `Flood report at ${location.trim()}`,
      severity,
      waterLevel,
      passable: severity !== "Impassable",
      photoUrl,
      description: description.trim(),
      author: CURRENT_USER.handle,
      confirms: 0,
      comments: 0,
    });

    setLocation("");
    setWaterLevel("Ankle");
    setSeverity(suggestRoadCondition("Ankle"));
    setDescription("");
    setPhotoUrl(undefined);

    onPosted?.();
  }

  return (
    <form onSubmit={onSubmit} className="px-4 pb-4 pt-4">
      <h1 className="font-display text-2xl font-extrabold text-navy">
        Report flooding
      </h1>
      <p className="text-sm text-navy/50">
        Help your neighbors stay safe
      </p>

      {/* Location */}
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
        required
        className="mt-2 w-full rounded-2xl border border-navy/15 bg-white px-4 py-3 text-sm"
      />

      {/* Water level */}
      <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-navy/50">
        Water level
      </p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {WATER_LEVELS.map((level) => {
          const active = waterLevel === level;

          return (
            <button
              key={level}
              type="button"
              onClick={() => {
                setWaterLevel(level);
                setSeverity(suggestRoadCondition(level));
              }}
              aria-pressed={active}
              className={`rounded-2xl border py-3 text-sm font-semibold ${
                active
                  ? "border-navy bg-navy text-white"
                  : "border-navy/15 bg-white text-navy"
              }`}
            >
              {level === "Waist+" ? "Waist-deep" : `${level}-deep`}
            </button>
          );
        })}
      </div>

      {/* Road condition */}
      <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-navy/50">
        Road condition
      </p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {ROAD_OPTIONS.map((option) => {
          const active = severity === option.severity;
          const color = severityColor(option.severity);

          return (
            <button
              key={option.severity}
              type="button"
              onClick={() => setSeverity(option.severity)}
              aria-pressed={active}
              style={
                active
                  ? { backgroundColor: color, color: "#fff" }
                  : { backgroundColor: `${color}1a`, color }
              }
              className="rounded-2xl py-3 text-sm font-semibold"
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Photo */}
      <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-navy/50">
        Photo
      </p>
      <label
        htmlFor="photo"
        className="mt-2 flex min-h-28 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-navy/20 bg-white/50 text-sm text-navy/50"
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="Selected flood photo"
            className="h-28 w-full object-cover"
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

      {/* Description */}
      <label
        htmlFor="description"
        className="mt-5 block text-xs font-semibold uppercase tracking-wide text-navy/50"
      >
        Description
      </label>
      <textarea
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe the flooding or share other important details..."
        rows={4}
        className="mt-2 w-full resize-none rounded-2xl border border-navy/15 bg-white px-4 py-3 text-sm"
      />

      {/* Submit */}
      <button
        type="submit"
        className="mt-6 w-full rounded-2xl bg-signal py-4 text-base font-semibold text-white"
      >
        Post report
      </button>
    </form>
  );
}
