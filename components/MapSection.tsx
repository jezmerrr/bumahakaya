"use client";

import dynamic from "next/dynamic";
import { useStore } from "@/lib/store";
import { NearbyBanner } from "./NearbyBanner";

const DLSU_CENTER = { lat: 14.5647, lng: 120.9936 };

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

  return (
    <div className="flex flex-col">
      <NearbyBanner userLocation={DLSU_CENTER} reports={markers} />
      <div className="h-[68vh] w-full">
        <MapView center={DLSU_CENTER} markers={markers} />
      </div>
      <p className="px-4 py-2 text-[11px] leading-snug text-navy/50">
        Green = madadaanan · amber = mag-ingat · red = hindi madaanan. Larger
        dots are FloodWatch sensors. Tap a dot for details.
      </p>
    </div>
  );
}
