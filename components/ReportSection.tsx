"use client";

import { useState, type FormEvent } from "react";
import { useStore } from "@/lib/store";
import { waterLevelToSeverity } from "@/lib/severity";
import type { LatLng } from "@/lib/geo";
import type { Severity, WaterLevel } from "@/lib/types";

const DLSU_CENTER: LatLng = { lat: 14.5647, lng: 120.9936 };

export function ReportSection() {
  const { addReport } = useStore();

  const [street, setStreet] = useState("");
  const [waterLevel, setWaterLevel] = useState<WaterLevel>("Knee");
  const [severity, setSeverity] = useState<Severity>("Caution");
  const [note, setNote] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [location, setLocation] = useState<LatLng>(DLSU_CENTER);
  const [locationLabel, setLocationLabel] = useState("DLSU Manila (default)");
  const [done, setDone] = useState(false);

  function useMyLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationLabel("Location unavailable — using DLSU Manila");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationLabel("Using your current location");
      },
      () => {
        setLocation(DLSU_CENTER);
        setLocationLabel("Location denied — using DLSU Manila");
      },
    );
  }

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPhotoUrl(file ? URL.createObjectURL(file) : undefined);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    addReport({
      lat: location.lat,
      lng: location.lng,
      streetName: street.trim() || "Unnamed street",
      severity,
      waterLevel,
      passable: severity !== "Impassable",
      note: note.trim() || undefined,
      photoUrl,
    });
    setStreet("");
    setNote("");
    setPhotoUrl(undefined);
    setDone(true);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 p-4">
      <div>
        <h2 className="font-display text-lg font-extrabold text-navy">
          Report a flooded street
        </h2>
        <p className="text-xs text-navy/50">
          Anonymous. Tulungan ang ibang commuter — i-report ang baha sa kalye mo.
        </p>
      </div>

      <div>
        <label
          htmlFor="street"
          className="block text-xs font-semibold text-navy"
        >
          Street or landmark
        </label>
        <input
          id="street"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          placeholder="e.g. Taft Ave cor. Vito Cruz"
          className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="water"
            className="block text-xs font-semibold text-navy"
          >
            Water level
          </label>
          <select
            id="water"
            value={waterLevel}
            onChange={(e) => {
              const level = e.target.value as WaterLevel;
              setWaterLevel(level);
              setSeverity(waterLevelToSeverity(level));
            }}
            className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
          >
            <option value="Ankle">Ankle (sakong)</option>
            <option value="Knee">Knee (tuhod)</option>
            <option value="Waist+">Waist+ (bewang)</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="status"
            className="block text-xs font-semibold text-navy"
          >
            Road status
          </label>
          <select
            id="status"
            value={severity}
            onChange={(e) => setSeverity(e.target.value as Severity)}
            className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
          >
            <option value="Passable">Madadaanan / Passable</option>
            <option value="Caution">Mag-ingat / Gutter-deep</option>
            <option value="Impassable">Hindi madaanan / Not passable</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="note" className="block text-xs font-semibold text-navy">
          Note (optional)
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Anong nakita mo?"
          className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="photo" className="block text-xs font-semibold text-navy">
          Photo (optional)
        </label>
        <input
          id="photo"
          type="file"
          accept="image/*"
          onChange={onPhoto}
          className="mt-1 w-full text-xs text-navy/70"
        />
      </div>

      <div className="flex items-center justify-between gap-2 rounded-xl bg-white p-3">
        <span className="text-xs text-navy/60">{locationLabel}</span>
        <button
          type="button"
          onClick={useMyLocation}
          className="rounded-full border border-signal px-3 py-1 text-xs font-semibold text-signal"
        >
          Use my location
        </button>
      </div>

      <button
        type="submit"
        className="w-full rounded-full bg-signal py-3 text-sm font-semibold text-white"
      >
        Submit report
      </button>

      {done ? (
        <p className="text-center text-xs font-semibold text-pass">
          Salamat! Your report is now on the map and feed.
        </p>
      ) : null}
    </form>
  );
}
