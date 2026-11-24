"use client";

import { Circle, CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import type { LatLng } from "@/lib/geo";
import { severityColor, severityLabel } from "@/lib/severity";
import { relativeTime } from "@/lib/time";
import type { Report } from "@/lib/types";

export default function MapView({
  center,
  markers,
}: {
  center: LatLng;
  markers: Report[];
}) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={16}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* Flood-affected areas */}
      {markers.map((m) => (
        <Circle
          key={`${m.id}-flood-area`}
          center={[m.lat, m.lng]}
          radius={
            m.waterLevel === "Waist+"
              ? 145
              : m.waterLevel === "Knee"
                ? 110
                : 75
          }
          pathOptions={{
            color: severityColor(m.severity),
            weight: 2,
            opacity: 0.9,
            dashArray: "3 7",
            lineCap: "round",
            fillColor: severityColor(m.severity),
            fillOpacity: 0.22,
          }}
        />
      ))}

      {/* Original map markers */}
      {markers.map((m) => (
        <CircleMarker
          key={m.id}
          center={[m.lat, m.lng]}
          radius={m.source === "sensor" ? 11 : 9}
          pathOptions={{
            color: "#ffffff",
            weight: 2,
            fillColor: severityColor(m.severity),
            fillOpacity: 0.9,
          }}
        >
          <Popup>
            <div className="space-y-0.5">
              <p className="font-semibold text-navy">{m.streetName}</p>
              <p style={{ color: severityColor(m.severity) }}>
                {severityLabel(m.severity)}
              </p>
              <p className="text-navy/70">
                Water: {m.waterLevel} ·{" "}
                {m.source === "sensor"
                  ? "Sensor"
                  : m.source === "official"
                    ? "Official"
                    : "Community"}
              </p>
              {m.note ? <p className="text-navy/70">{m.note}</p> : null}
              <p className="text-navy/50">{relativeTime(m.timestamp)}</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
