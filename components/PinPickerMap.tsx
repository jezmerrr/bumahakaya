"use client";

import { divIcon, type LeafletEvent, type Marker as LeafletMarker } from "leaflet";
import {
  AttributionControl,
  MapContainer,
  Marker,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import type { LatLng } from "@/lib/geo";

// Classic drop pin in brand blue; static markup only.
const DROP_PIN = divIcon({
  className: "map-pin-wrap",
  html: '<svg class="map-drop-pin" viewBox="0 0 32 42" width="32" height="42"><path d="M16 41s13-14.2 13-24A13 13 0 0 0 3 17c0 9.8 13 24 13 24Z" fill="#1e6fd9" stroke="#fff" stroke-width="2.5"/><circle cx="16" cy="16.5" r="5" fill="#fff"/></svg>',
  iconSize: [32, 42],
  iconAnchor: [16, 41],
});

function TapToPin({ onChange }: { onChange: (p: LatLng) => void }) {
  useMapEvents({
    click: (e) => onChange({ lat: e.latlng.lat, lng: e.latlng.lng }),
  });
  return null;
}

// Map for choosing where a report goes: tap to drop the pin, drag to adjust.
export default function PinPickerMap({
  value,
  center,
  onChange,
}: {
  value: LatLng | null;
  center: LatLng;
  onChange: (p: LatLng) => void;
}) {
  const start = value ?? center;
  return (
    <MapContainer
      center={[start.lat, start.lng]}
      zoom={17}
      attributionControl={false}
      className="map-modern h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <AttributionControl position="topright" prefix={false} />
      <TapToPin onChange={onChange} />
      {value ? (
        <Marker
          position={[value.lat, value.lng]}
          icon={DROP_PIN}
          draggable
          title="Flood location (drag to adjust)"
          eventHandlers={{
            dragend: (e: LeafletEvent) => {
              const p = (e.target as LeafletMarker).getLatLng();
              onChange({ lat: p.lat, lng: p.lng });
            },
          }}
        />
      ) : null}
    </MapContainer>
  );
}
