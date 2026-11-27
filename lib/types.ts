export type Severity = "Passable" | "Caution" | "Impassable";

export type WaterLevel = "Ankle" | "Knee" | "Waist+";

export type Source = "community" | "sensor" | "official";

export type AnnouncementSource = "lgu" | "school" | "sensor" | "weather";

export type Trend = "rising" | "steady" | "falling";

export interface Report {
  id: string;
  lat: number;
  lng: number;
  streetName: string;
  severity: Severity;
  waterLevel: WaterLevel;
  passable: boolean;
  photoUrl?: string;
  note?: string;
  source: Source;
  timestamp: string;
  // Optional richer fields used by the Home feed cards.
  author?: string;
  headline?: string;
  description?: string;
  sensorCm?: number;
  trend?: Trend;
  confirms?: number;
  comments?: number;
}

// A single historical water-level reading from one IoT sensor.
// Used by the business dashboard's historical analytics.
export interface SensorReading {
  sensorId: string;
  streetName: string;
  cm: number;
  timestamp: string;
}

export interface Comment {
  id: string;
  reportId: string;
  author: string;
  text: string;
  timestamp: string;
}

export type AnnouncementType = "suspension" | "closure" | "advisory";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  agency: string;
  type: AnnouncementType;
  source: AnnouncementSource;
  timestamp: string;
}

export type Platform = "facebook" | "x" | "reddit";

export interface SocialPost {
  id: string;
  platform: Platform;
  author: string;
  text: string;
  timestamp: string;
  link: string;
}
