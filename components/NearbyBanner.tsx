import { reportsNearby, type LatLng } from "@/lib/geo";
import type { Report } from "@/lib/types";

const RADIUS_M = 400;

export function NearbyBanner({
  userLocation,
  reports,
}: {
  userLocation: LatLng | null;
  reports: Report[];
}) {
  if (!userLocation) return null;

  const near = reportsNearby(userLocation, reports, RADIUS_M);
  if (near.length === 0) return null;

  return (
    <div className="flex items-center gap-2 bg-amber px-4 py-2 text-sm font-semibold text-white">
      <span aria-hidden>⚠</span>
      <span>
        Baha malapit sa&apos;yo — flooding reported near you ({near.length}{" "}
        {near.length === 1 ? "report" : "reports"}).
      </span>
    </div>
  );
}
