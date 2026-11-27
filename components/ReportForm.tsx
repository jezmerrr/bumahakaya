"use client";

/* eslint-disable @next/next/no-img-element */
import { useId, useState, type FormEvent, type ReactNode } from "react";
import { severityColor, severityInk, waterLevelLabel } from "@/lib/severity";
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
  "block text-xs font-semibold uppercase tracking-wide text-navy/65";
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
    if (file) setPhotoUrl(URL.createObjectURL(file));
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
        className="mt-2 w-full rounded-2xl border border-navy/15 bg-white px-4 py-3 text-sm"
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
                  ? "border-navy bg-navy text-white"
                  : "border-navy/15 bg-white text-navy"
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
                  ? { backgroundColor: ink, color: "#fff" }
                  : {
                      // Tint over white, so the text stays readable on any page color
                      backgroundColor: "#fff",
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
        className="mt-2 flex min-h-28 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-navy/20 bg-white/50 text-sm text-navy/65"
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
          <span className="text-navy/60">Tap the photo to change it</span>
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
        className="mt-2 w-full resize-none rounded-2xl border border-navy/15 bg-white px-4 py-3 text-sm"
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
          className="mt-2 w-full rounded-2xl py-3 text-sm font-semibold text-navy/70"
        >
          Cancel
        </button>
      ) : null}
    </form>
  );
}
