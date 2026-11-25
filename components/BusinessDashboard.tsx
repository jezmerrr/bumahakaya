
"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useStore } from "@/lib/store";
import { reportsNearby, type LatLng } from "@/lib/geo";
import type { Report } from "@/lib/types";
import {
  AlertTriangle,
  MapPin,
  Construction,
  Waves,
  CloudRain,
} from "lucide-react";

const DLSU_CENTER: LatLng = {
  lat: 14.5647,
  lng: 120.9936,
};

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center text-sm text-navy/50">
      Loading map...
    </div>
  ),
});

export function BusinessDashboard({
  onBack,
}: {
  onBack: () => void;
}) {
  const { reports, sensors } = useStore();

  // Combine community reports and sensor readings for the map.
  const markers: Report[] = [...reports, ...sensors];

  // Get locations within 700 meters of the monitored area.
  const nearbyMarkers = reportsNearby(
    DLSU_CENTER,
    markers,
    700,
  );

  const metrics = useMemo(() => {
    const nearbyReports = reports.length;

    const affectedRoads = new Set(
      [...reports, ...sensors]
        .filter((item) => item.severity !== "Passable")
        .map((item) => item.streetName),
    ).size;

    const latestSensor = [...sensors].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() -
        new Date(a.timestamp).getTime(),
    )[0];

    const highRisk = sensors.some(
      (sensor) => sensor.severity === "Impassable",
    );

    return {
      nearbyReports,
      affectedRoads,
      latestSensor,
      highRisk,
    };
  }, [reports, sensors]);

  const trend = metrics.latestSensor?.trend ?? "steady";

  const trendLabel = {
    rising: "Rising",
    steady: "Steady",
    falling: "Falling",
  }[trend];

  return (
    <div className="space-y-3 px-4 pb-6 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-semibold text-navy/60"
        >
          ‹ Back
        </button>

        <span className="rounded-full bg-[#E8F3EF] px-3 py-1 text-xs font-semibold text-[#247A60]">
          Business
        </span>
      </div>

      <div>
        <h1 className="font-display text-2xl font-extrabold text-navy">
          BumahaKaya
        </h1>
        <p className="text-xs text-navy/50">
          Business flood monitoring
        </p>
      </div>

      {/* Flood Risk */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-navy/50">
          Flood Risk · Taft Avenue
        </p>

        <div className="mt-2 flex items-center justify-between">
          <div>
            <h2
              className={`text-2xl font-extrabold ${
                metrics.highRisk ? "text-impass" : "text-[#247A60]"
              }`}
            >
              {metrics.highRisk ? "High Risk" : "Moderate Risk"}
            </h2>

            <p className="mt-1 text-xs text-navy/60">
              Based on recent sensor readings
            </p>
          </div>

          <AlertTriangle
            className={`h-6 w-6 ${
              metrics.highRisk ? "text-impass" : "text-[#247A60]"
            }`}
          />
        </div>
      </section>

      {/* Metric Cards */}
      <section className="grid grid-cols-2 gap-2">
        <MetricCard
          icon={<MapPin />}
          value={metrics.nearbyReports}
          label="Nearby reports"
        />

        <MetricCard
          icon={<Construction />}
          value={metrics.affectedRoads}
          label="Affected roads"
        />

        <MetricCard
          icon={<Waves />}
          value={
            metrics.latestSensor?.sensorCm != null
              ? `${metrics.latestSensor.sensorCm} cm`
              : "—"
          }
          label="Water level"
        />

        <MetricCard
          icon={<CloudRain />}
          value="—"
          label="Rainfall"
        />
      </section>

      {/* Flood Monitoring Map */}
      <section className="rounded-2xl border border-navy/10 bg-white p-4">
        <h2 className="font-bold text-navy">
          Flood monitoring map
        </h2>

        <div className="relative mt-3 h-48 overflow-hidden rounded-xl">
          <MapView
            center={DLSU_CENTER}
            markers={markers}
          />
        </div>

        <p className="mt-2 text-[10px] text-navy/50">
          Affected zones · Community reports · Sensors
        </p>

        <p className="mt-1 text-[10px] text-navy/40">
          {nearbyMarkers.length} locations within 700m
        </p>
      </section>

      {/* Water-Level Trend */}
      <section className="rounded-2xl border border-navy/10 bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-navy">
            Water-level trend
          </h2>

          <span className="rounded-full bg-amber/15 px-2 py-1 text-[10px] font-bold capitalize text-amber">
            {trendLabel}
          </span>
        </div>

        <p className="mt-3 text-xs text-navy/50">
          Latest sensor reading
        </p>

        <div className="mt-3 flex h-12 items-end gap-1">
          {sensors.slice(0, 8).map((sensor) => (
            <div
              key={sensor.id}
              className="flex-1 rounded-t-sm bg-[#8CCFC4]"
              style={{
                height: `${Math.max(
                  12,
                  Math.min(
                    100,
                    ((sensor.sensorCm ?? 0) / 71) * 100,
                  ),
                )}%`,
              }}
            />
          ))}
        </div>

        <p className="mt-2 text-[10px] text-navy/50">
          Sample readings only · Not historical data
        </p>
      </section>

      <p className="text-center text-[10px] text-navy/40">
        Business / Institutional Dashboard · Sample preview
      </p>
    </div>
  );
}

function MetricCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-3 shadow-sm">
      <div className="text-navy/40 [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </div>

      <p className="mt-2 font-display text-xl font-extrabold text-navy">
        {value}
      </p>

      <p className="mt-1 text-xs text-navy/60">
        {label}
      </p>
    </div>
  );
}
