
"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useStore } from "@/lib/store";
import { reportsNearby, type LatLng } from "@/lib/geo";
import type { Report } from "@/lib/types";
import {
  averagedSeries,
  floodHotspots,
  readingsToCSV,
  readingsWithin,
  IMPASSABLE_CM,
  RANGE_HOURS,
  RANGE_LABEL,
  type RangeKey,
} from "@/lib/analytics";
import {
  AlertTriangle,
  MapPin,
  Construction,
  Waves,
  CloudRain,
  FileDown,
  TrendingUp,
  Lock,
} from "lucide-react";

const DLSU_CENTER: LatLng = {
  lat: 14.5647,
  lng: 120.9936,
};

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center text-sm text-navy/65">
      Loading map...
    </div>
  ),
});

export function BusinessDashboard({
  onBack,
}: {
  onBack: () => void;
}) {
  const { reports, sensors, sensorHistory } = useStore();

  const [range, setRange] = useState<RangeKey>("7d");

  // Historical analytics derived from the selected time range.
  const { series, hotspots, windowReadings } = useMemo(() => {
    const hours = RANGE_HOURS[range];
    const now = Date.now();
    return {
      series: averagedSeries(sensorHistory, hours, 48, now),
      hotspots: floodHotspots(sensorHistory, hours, now),
      windowReadings: readingsWithin(sensorHistory, hours, now),
    };
  }, [sensorHistory, range]);

  function downloadReport() {
    const csv = readingsToCSV(windowReadings);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `floodwatch-report-${range}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

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
          className="text-sm font-semibold text-navy/70"
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
        <p className="text-xs text-navy/65">
          Business flood monitoring
        </p>
      </div>

      {/* Flood Risk */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-navy/65">
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

            <p className="mt-1 text-xs text-navy/70">
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

        <p className="mt-2 text-[10px] text-navy/65">
          Affected zones · Community reports · Sensors
        </p>

        <p className="mt-1 text-[10px] text-navy/60">
          {nearbyMarkers.length} locations within 700m
        </p>
      </section>

      {/* Range selector */}
      <div className="flex items-center gap-1.5">
        {(Object.keys(RANGE_HOURS) as RangeKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setRange(key)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              range === key
                ? "bg-navy text-white"
                : "bg-white text-navy/70 border border-navy/10"
            }`}
          >
            {RANGE_LABEL[key]}
          </button>
        ))}
      </div>

      {/* Historical Water-Level Trend */}
      <section className="rounded-2xl border border-navy/10 bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-navy">Water-level trend</h2>
          <span className="flex items-center gap-1 rounded-full bg-amber/15 px-2 py-1 text-[10px] font-bold capitalize text-amber">
            <TrendingUp className="h-3 w-3" />
            {trendLabel}
          </span>
        </div>

        <p className="mt-1 text-xs text-navy/65">
          Average across all sensors · last {RANGE_LABEL[range]}
        </p>

        <TrendChart points={series} threshold={IMPASSABLE_CM} />

        <div className="mt-2 flex items-center gap-3 text-[10px] text-navy/65">
          <span className="flex items-center gap-1">
            <span className="h-0.5 w-3 bg-[#247A60]" /> Water level (cm)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-0.5 w-3 border-t border-dashed border-impass" />
            Not passable ≥ {IMPASSABLE_CM} cm
          </span>
        </div>
      </section>

      {/* Flood Hotspots */}
      <section className="rounded-2xl border border-navy/10 bg-white p-4">
        <h2 className="font-bold text-navy">Flood hotspots</h2>
        <p className="mt-1 text-xs text-navy/65">
          Streets ranked by flood events · last {RANGE_LABEL[range]}
        </p>

        <ol className="mt-3 space-y-2">
          {hotspots.length === 0 && (
            <li className="text-xs text-navy/60">
              No streets crossed the not-passable level in this period.
            </li>
          )}
          {hotspots.map((h, i) => (
            <li key={h.streetName} className="flex items-center gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-navy/5 text-xs font-bold text-navy">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-navy">
                  {h.streetName}
                </p>
                <div className="mt-1 h-1.5 w-full rounded-full bg-navy/5">
                  <div
                    className="h-1.5 rounded-full bg-impass"
                    style={{
                      width: `${Math.min(
                        100,
                        (h.floodEvents / (hotspots[0]?.floodEvents || 1)) * 100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-impass">
                  {h.floodEvents}×
                </p>
                <p className="text-[10px] text-navy/65">peak {h.peakCm}cm</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Customized Flood Report */}
      <section className="rounded-2xl border border-navy/10 bg-white p-4">
        <h2 className="font-bold text-navy">Customized flood report</h2>
        <p className="mt-1 text-xs text-navy/70">
          Export the historical sensor data for this period for planning or
          site-risk analysis.
        </p>

        <button
          type="button"
          onClick={downloadReport}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white"
        >
          <FileDown className="h-4 w-4" />
          Generate report · {windowReadings.length} readings (CSV)
        </button>

        <p className="mt-2 text-[10px] text-navy/60">
          Custom reports priced ₱5,000–₱20,000 per the period and area covered.
        </p>
      </section>

      {/* Subscription Tiers */}
      <section className="rounded-2xl border border-navy/10 bg-white p-4">
        <h2 className="font-bold text-navy">Dashboard subscription</h2>
        <p className="mt-1 text-xs text-navy/65">
          Monthly monitoring access by organization size.
        </p>

        <div className="mt-3 space-y-2">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={`flex items-center justify-between rounded-xl border p-3 ${
                t.current
                  ? "border-[#247A60]/40 bg-[#E8F3EF]"
                  : "border-navy/10 bg-white"
              }`}
            >
              <div>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-navy">
                  {!t.current && <Lock className="h-3 w-3 text-navy/45" />}
                  {t.name}
                </p>
                <p className="text-[10px] text-navy/65">{t.who}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-navy">{t.price}</p>
                {t.current ? (
                  <p className="text-[10px] font-semibold text-[#247A60]">
                    Current plan
                  </p>
                ) : (
                  <p className="text-[10px] text-navy/60">/ month</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="text-center text-[10px] text-navy/60">
        Business / Institutional Dashboard · Demo data, clearly labeled
      </p>
    </div>
  );
}

const TIERS = [
  {
    name: "Basic",
    who: "Single business or condo",
    price: "₱1,500–3,000",
    current: false,
  },
  {
    name: "Institutional",
    who: "DLSU Admin, large institutions",
    price: "₱8,000–15,000",
    current: true,
  },
  {
    name: "LGU / Barangay",
    who: "Multi-zone coverage",
    price: "₱15,000–30,000",
    current: false,
  },
];

// Simple SVG line chart for the averaged water-level series.
function TrendChart({
  points,
  threshold,
}: {
  points: { t: number; cm: number }[];
  threshold: number;
}) {
  const W = 300;
  const H = 90;
  const pad = 4;

  if (points.length < 2) {
    return (
      <p className="mt-4 text-xs text-navy/60">Not enough data to chart.</p>
    );
  }

  const maxCm = Math.max(threshold + 10, ...points.map((p) => p.cm));
  const x = (i: number) =>
    pad + (i / (points.length - 1)) * (W - pad * 2);
  const y = (cm: number) =>
    pad + (1 - cm / maxCm) * (H - pad * 2);

  const line = points.map((p, i) => `${x(i)},${y(p.cm)}`).join(" ");
  const area = `${pad},${H - pad} ${line} ${W - pad},${H - pad}`;
  const thresholdY = y(threshold);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="mt-3 h-24 w-full"
      preserveAspectRatio="none"
    >
      <polygon points={area} fill="#247A60" opacity={0.08} />
      <line
        x1={pad}
        x2={W - pad}
        y1={thresholdY}
        y2={thresholdY}
        stroke="#c93a3a"
        strokeWidth={1}
        strokeDasharray="4 3"
      />
      <polyline
        points={line}
        fill="none"
        stroke="#247A60"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
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
      <div className="text-navy/60 [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </div>

      <p className="mt-2 font-display text-xl font-extrabold text-navy">
        {value}
      </p>

      <p className="mt-1 text-xs text-navy/70">
        {label}
      </p>
    </div>
  );
}
