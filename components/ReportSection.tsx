"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import type { LatLng } from "@/lib/geo";
import { CURRENT_USER } from "@/lib/user";
import { headlineFor, ReportForm, type ReportFormValues } from "./ReportForm";

const DLSU_CENTER: LatLng = { lat: 14.5647, lng: 120.9936 };

export function ReportSection({ onPosted }: { onPosted?: () => void }) {
  const { addReport } = useStore();
  // Bumped after each post so the form remounts empty.
  const [formKey, setFormKey] = useState(0);

  function post(values: ReportFormValues) {
    addReport({
      lat: DLSU_CENTER.lat,
      lng: DLSU_CENTER.lng,
      streetName: values.location,
      headline: headlineFor(values.location),
      severity: values.severity,
      waterLevel: values.waterLevel,
      passable: values.severity !== "Impassable",
      photoUrl: values.photoUrl,
      description: values.description,
      author: CURRENT_USER.handle,
      confirms: 0,
      comments: 0,
    });

    setFormKey((k) => k + 1);
    onPosted?.();
  }

  return (
    <ReportForm
      key={formKey}
      submitLabel="Post report"
      onSubmit={post}
      className="px-4 pb-4 pt-4"
    >
      <h1 className="font-display text-2xl font-extrabold text-navy">
        Report flooding
      </h1>
      <p className="text-sm text-navy/50">Help your neighbors stay safe</p>
    </ReportForm>
  );
}
