"use client";

import { divIcon, type Map as LeafletMap } from "leaflet";
import {
  AttributionControl,
  Circle,
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
import type { LatLng } from "@/lib/geo";
import { severityColor, severityShort } from "@/lib/severity";
import type { Report, Severity } from "@/lib/types";

// Pin artwork. Static strings only: never put report text in here, because
// Leaflet inserts it as HTML.
const PERSON_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6"/></svg>';
const SENSOR_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M2 8c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0"/><path d="M2 14c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0"/><path d="M2 20c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0"/></svg>';

type Kind = "sensor" | "community";

function makePin(severity: Severity, kind: Kind, selected: boolean) {
  const size = selected ? 44 : 34;
  return divIcon({
    className: "map-pin-wrap",
    html: `<span class="map-pin${selected ? " map-pin-selected" : ""}" style="--pin:${severityColor(
      severity,
    )}">${kind === "sensor" ? SENSOR_SVG : PERSON_SVG}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    tooltipAnchor: [0, -size / 2],
  });
}

// Every pin variant is built once, so markers don't flicker on re-render.
const PINS: Record<string, ReturnType<typeof divIcon>> = {};
for (const s of ["Passable", "Caution", "Impassable"] as Severity[]) {
  for (const k of ["sensor", "community"] as Kind[]) {
    PINS[`${s}-${k}-0`] = makePin(s, k, false);
    PINS[`${s}-${k}-1`] = makePin(s, k, true);
  }
}

const YOU_PIN = divIcon({
  className: "map-pin-wrap",
  html: '<span class="map-you"><span class="map-you-pulse"></span><span class="map-you-dot"></span></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const ZONE_RADIUS = { Ankle: 75, Knee: 110, "Waist+": 145 } as const;

function DeselectOnMapTap({ onSelect }: { onSelect?: (id: string | null) => void }) {
  useMapEvents({ click: () => onSelect?.(null) });
  return null;
}

export default function MapView({
  center,
  markers,
  selectedId = null,
  onSelect,
  onMap,
}: {
  center: LatLng;
  markers: Report[];
  // Optional: the Business Dashboard shows the map without selection.
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onMap?: (map: LeafletMap | null) => void;
}) {
  return (
    <MapContainer
      ref={onMap}
      center={[center.lat, center.lng]}
      zoom={16}
      zoomControl={false}
      attributionControl={false}
      scrollWheelZoom
      className="map-modern h-full w-full"
    >
      {/* Free, keyless OpenStreetMap tiles; softened in CSS (.map-modern). */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <AttributionControl position="topright" prefix={false} />
      <DeselectOnMapTap onSelect={onSelect} />

      {/* Soft flood zones; they don't catch taps */}
      {markers.map((m) => {
        const color = severityColor(m.severity);
        return (
          <Circle
            key={`${m.id}-zone`}
            center={[m.lat, m.lng]}
            radius={ZONE_RADIUS[m.waterLevel]}
            interactive={false}
            pathOptions={{
              color,
              weight: 1,
              opacity: 0.4,
              fillColor: color,
              fillOpacity: m.id === selectedId ? 0.24 : 0.12,
            }}
          />
        );
      })}

      {/* You are here (the demo user is at DLSU) */}
      <Marker
        position={[center.lat, center.lng]}
        icon={YOU_PIN}
        interactive={false}
        keyboard={false}
      />

      {markers.map((m) => {
        const selected = m.id === selectedId;
        const kind: Kind = m.source === "sensor" ? "sensor" : "community";
        const title = m.headline ?? m.streetName;
        return (
          <Marker
            key={m.id}
            position={[m.lat, m.lng]}
            icon={PINS[`${m.severity}-${kind}-${selected ? 1 : 0}`]}
            title={`${title}, ${severityShort(m.severity)}`}
            zIndexOffset={selected ? 1000 : kind === "sensor" ? 100 : 0}
            // Pins are only tappable (and focusable) when selection is on.
            interactive={onSelect != null}
            keyboard={onSelect != null}
            eventHandlers={{ click: () => onSelect?.(m.id) }}
          >
            {selected ? (
              <Tooltip
                permanent
                direction="top"
                offset={[0, -6]}
                className="map-chip"
              >
                {title}
              </Tooltip>
            ) : null}
          </Marker>
        );
      })}
    </MapContainer>
  );
}
