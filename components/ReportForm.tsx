"use client";

/* eslint-disable @next/next/no-img-element */
import { useId, useState, type FormEvent, type ReactNode } from "react";
import {
  severityColor,
  severityFill,
  severityInk,
  waterLevelLabel,
} from "@/lib/severity";
import { compressPhoto } from "@/lib/photo";
import type { Severity, WaterLevel } from "@/lib/types";

export interface ReportFormValues {
  location: string;
  waterLevel: WaterLevel;
  severity: Severity;
  description: string;
  photoUrl?: string;
}

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

export const EMPTY_REPORT: ReportFormValues = {
  location: "",
  waterLevel: "Ankle",
  severity: suggestRoadCondition("Ankle"),
  description: "",
};

// Headline given to reports posted from the form. Kept here so editing can
// tell an auto headline (safe to update with the location) from a custom one.
export function headlineFor(location: string): string {
  return `Flood report at ${location}`;
}

const labelText =
  "block text-xs font-semibold uppercase tracking-wide text-ink/65";
const sectionLabel = `mt-5 ${labelText}`;

// The flood report form, used both to post a new report (Report tab) and to
// edit one you already posted, so the two always look and behave the same.
export function ReportForm({
  initial = EMPTY_REPORT,
  submitLabel,
  onSubmit,
  onCancel,
  className,
  children,
}: {
  initial?: ReportFormValues;
  submitLabel: string;
  onSubmit: (values: ReportFormValues) => void;
  onCancel?: () => void;
  className?: string;
  // Optional heading rendered above the fields.
  children?: ReactNode;
}) {
  const id = useId();
  const [location, setLocation] = useState(initial.location);
  const [waterLevel, setWaterLevel] = useState<WaterLevel>(initial.waterLevel);
  const [severity, setSeverity] = useState<Severity>(initial.severity);
  const [description, setDescription] = useState(initial.description);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(
    initial.photoUrl,
  );

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Save a compressed copy so the photo survives a reload; if the browser
    // can't, fall back to a link that works for this visit.
    compressPhoto(file)
      .then(setPhotoUrl)
      .catch(() => setPhotoUrl(URL.createObjectURL(file)));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!location.trim()) return;
    onSubmit({
      location: location.trim(),
      waterLevel,
      severity,
      description: description.trim(),
      photoUrl,
    });
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}

      {/* Location */}
      <label
        htmlFor={`${id}-location`}
        className={`${labelText} ${children ? "mt-6" : ""}`}
      >
        Location
      </label>
      <input
        id={`${id}-location`}
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="e.g. Taft Ave cor. Estrada"
        required
        className="mt-2 w-full rounded-2xl border border-ink/15 bg-surface px-4 py-3 text-sm"
      />

      {/* Water level */}
      <p className={sectionLabel}>Water level</p>
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
                  ? "border-ink bg-ink text-surface"
                  : "border-ink/15 bg-surface text-ink"
              }`}
            >
              {waterLevelLabel(level)}
            </button>
          );
        })}
      </div>

      {/* Road condition */}
      <p className={sectionLabel}>Road condition</p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {ROAD_OPTIONS.map((option) => {
          const active = severity === option.severity;
          const color = severityColor(option.severity);
          const ink = severityInk(option.severity);

          return (
            <button
              key={option.severity}
              type="button"
              onClick={() => setSeverity(option.severity)}
              aria-pressed={active}
              style={
                active
                  ? { backgroundColor: severityFill(option.severity), color: "#fff" }
                  : {
                      // Tint over the card color, so the text stays readable on any page color
                      backgroundColor: "var(--color-surface)",
                      backgroundImage: `linear-gradient(${color}1f, ${color}1f)`,
                      color: ink,
                    }
              }
              className="rounded-2xl py-3 text-sm font-semibold"
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Photo */}
      <p className={sectionLabel}>Photo</p>
      <label
        htmlFor={`${id}-photo`}
        className="mt-2 flex min-h-28 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-ink/20 bg-surface/50 text-sm text-ink/65"
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
          id={`${id}-photo`}
          type="file"
          accept="image/*"
          onChange={onPhoto}
          className="hidden"
        />
      </label>
      {photoUrl ? (
        <div className="mt-1.5 flex justify-between text-xs">
          <span className="text-ink/60">Tap the photo to change it</span>
          <button
            type="button"
            onClick={() => setPhotoUrl(undefined)}
            className="font-semibold text-impass"
          >
            Remove photo
          </button>
        </div>
      ) : null}

      {/* Description */}
      <label htmlFor={`${id}-description`} className={sectionLabel}>
        Description
      </label>
      <textarea
        id={`${id}-description`}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe the flooding or share other important details..."
        rows={4}
        className="mt-2 w-full resize-none rounded-2xl border border-ink/15 bg-surface px-4 py-3 text-sm"
      />

      {/* Submit */}
      <button
        type="submit"
        className="mt-6 w-full rounded-2xl bg-signal py-4 text-base font-semibold text-white"
      >
        {submitLabel}
      </button>
      {onCancel ? (
        <button
          type="button"
          onClick={onCancel}
          className="mt-2 w-full rounded-2xl py-3 text-sm font-semibold text-ink/70"
        >
          Cancel
        </button>
      ) : null}
    </form>
  );
}
