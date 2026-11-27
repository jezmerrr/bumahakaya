import type {
  Announcement,
  Comment,
  Report,
  SensorReading,
  SocialPost,
} from "@/lib/types";

const minsAgo = (n: number): string =>
  new Date(Date.now() - n * 60_000).toISOString();

export const seedReports: Report[] = [
  {
    id: "r-001",
    lat: 14.5603,
    lng: 120.9941,
    streetName: "Taft Avenue, Malate",
    headline: "Flooding Taft Ave cor. Estrada",
    description: "Knee-deep flooding, hard for cars to get through.",
    author: "jleofando",
    severity: "Impassable",
    waterLevel: "Knee",
    passable: false,
    sensorCm: 45,
    trend: "rising",
    confirms: 12,
    comments: 3,
    source: "community",
    timestamp: minsAgo(5),
  },
  {
    id: "r-002",
    lat: 14.5666,
    lng: 120.9948,
    streetName: "Taft Avenue, Malate",
    headline: "Road near Henry still passable",
    description: "Gutter-deep water, motorbikes passing slowly.",
    author: "jramos",
    severity: "Caution",
    waterLevel: "Knee",
    passable: true,
    sensorCm: 28,
    trend: "steady",
    confirms: 23,
    comments: 6,
    source: "community",
    timestamp: minsAgo(17),
  },
  {
    id: "r-003",
    lat: 14.5629,
    lng: 120.9955,
    streetName: "Estrada St, Malate",
    headline: "Estrada corner clearing up",
    description: "Ankle-deep na lang, kaya nang dumaan.",
    author: "denise.dc",
    severity: "Caution",
    waterLevel: "Ankle",
    passable: true,
    sensorCm: 12,
    trend: "falling",
    confirms: 8,
    comments: 1,
    source: "community",
    timestamp: minsAgo(22),
  },
  {
    id: "r-004",
    lat: 14.5641,
    lng: 120.9939,
    streetName: "Taft Avenue (near Gokongwei)",
    headline: "Taft near campus passable",
    description: "Konting tubig lang, ok naman dumaan.",
    author: "rendel.o",
    severity: "Passable",
    waterLevel: "Ankle",
    passable: true,
    sensorCm: 6,
    trend: "steady",
    confirms: 15,
    comments: 2,
    source: "community",
    timestamp: minsAgo(28),
  },
  {
    id: "r-005",
    lat: 14.5657,
    lng: 120.9935,
    streetName: "Fidel A. Reyes St (Dagonoy)",
    headline: "Dagonoy side hindi madaanan",
    description: "Baha hanggang bewang malapit sa tindahan.",
    author: "edson.w",
    severity: "Impassable",
    waterLevel: "Waist+",
    passable: false,
    sensorCm: 64,
    trend: "rising",
    confirms: 31,
    comments: 9,
    source: "community",
    timestamp: minsAgo(34),
  },
  {
    id: "r-006",
    lat: 14.5614,
    lng: 120.9929,
    streetName: "Leon Guinto St, Malate",
    headline: "Leon Guinto gutter-deep",
    description: "Mag-ingat, tumataas pa ang tubig.",
    author: "commuter_ph",
    severity: "Caution",
    waterLevel: "Knee",
    passable: true,
    sensorCm: 25,
    trend: "rising",
    confirms: 7,
    comments: 0,
    source: "community",
    timestamp: minsAgo(41),
  },
  {
    id: "r-007",
    lat: 14.5649,
    lng: 120.9952,
    streetName: "Castro St, Malate",
    headline: "Castro St clear",
    description: "Walang baha, smooth ang daan.",
    author: "jm.santos",
    severity: "Passable",
    waterLevel: "Ankle",
    passable: true,
    sensorCm: 3,
    trend: "steady",
    confirms: 5,
    comments: 0,
    source: "community",
    timestamp: minsAgo(52),
  },
  {
    id: "r-008",
    lat: 14.5622,
    lng: 120.9937,
    streetName: "Taft Avenue (near PWU)",
    headline: "Taft near PWU gutter-deep",
    description: "Dahan-dahan ang jeep pero dumadaan pa.",
    author: "lasalle_walk",
    severity: "Caution",
    waterLevel: "Knee",
    passable: true,
    sensorCm: 22,
    trend: "steady",
    confirms: 11,
    comments: 2,
    source: "community",
    timestamp: minsAgo(63),
  },
];

export const seedSensors: Report[] = [
  {
    id: "s-01",
    lat: 14.5604,
    lng: 120.994,
    streetName: "FloodWatch Sensor 01, Taft Ave cor. Vito Cruz",
    severity: "Caution",
    waterLevel: "Knee",
    passable: true,
    sensorCm: 32,
    trend: "rising",
    source: "sensor",
    timestamp: minsAgo(3),
  },
  {
    id: "s-02",
    lat: 14.5665,
    lng: 120.9946,
    streetName: "FloodWatch Sensor 02 at Agno St",
    severity: "Impassable",
    waterLevel: "Waist+",
    passable: false,
    sensorCm: 71,
    trend: "rising",
    source: "sensor",
    timestamp: minsAgo(4),
  },
  {
    id: "s-03",
    lat: 14.5658,
    lng: 120.9934,
    streetName: "FloodWatch Sensor 03, Taft Ave cor. Dagonoy",
    severity: "Impassable",
    waterLevel: "Waist+",
    passable: false,
    sensorCm: 64,
    trend: "steady",
    note: "Huwag galawin.",
    source: "sensor",
    timestamp: minsAgo(5),
  },
  {
    id: "s-04",
    lat: 14.5629,
    lng: 120.9953,
    streetName: "FloodWatch Sensor 04 at Estrada St",
    severity: "Caution",
    waterLevel: "Ankle",
    passable: true,
    sensorCm: 14,
    trend: "falling",
    source: "sensor",
    timestamp: minsAgo(5),
  },
];

// --- Historical sensor readings (demo data for the business dashboard) ---
// Deterministic generator: 14 days of hourly water-level readings for the
// four pilot sensors. Agno St floods most often so the hotspot ranking has a
// clear #1. Seeded so every reload shows the same history.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface SensorMeta {
  sensorId: string;
  streetName: string;
  base: number; // dry-weather water level (cm)
  floodChance: number; // hourly probability a storm surge starts
  seed: number;
}

const SENSOR_META: SensorMeta[] = [
  { sensorId: "s-01", streetName: "Taft Ave cor. Vito Cruz", base: 10, floodChance: 0.03, seed: 101 },
  { sensorId: "s-02", streetName: "Agno St (Fidel A. Reyes)", base: 14, floodChance: 0.06, seed: 202 },
  { sensorId: "s-03", streetName: "Taft Ave cor. Dagonoy", base: 12, floodChance: 0.05, seed: 303 },
  { sensorId: "s-04", streetName: "Estrada St", base: 7, floodChance: 0.02, seed: 404 },
];

function buildSensorHistory(hours = 336): SensorReading[] {
  const now = Date.now();
  const readings: SensorReading[] = [];
  for (const s of SENSOR_META) {
    const rand = mulberry32(s.seed);
    let surge = 0;
    for (let h = hours; h >= 0; h--) {
      const t = now - h * 3_600_000;
      const hourOfDay = new Date(t).getHours();
      const diurnal = hourOfDay >= 14 && hourOfDay <= 20 ? 4 : 0; // afternoon rains
      if (rand() < s.floodChance) surge = 38 + rand() * 42; // storm starts
      const noise = (rand() - 0.5) * 6;
      const cm = Math.max(0, Math.round(s.base + diurnal + noise + surge));
      surge *= 0.6; // recede each hour
      readings.push({
        sensorId: s.sensorId,
        streetName: s.streetName,
        cm,
        timestamp: new Date(t).toISOString(),
      });
    }
  }
  return readings;
}

export const seedSensorHistory: SensorReading[] = buildSensorHistory();

export const seedComments: Comment[] = [
  {
    id: "c-001",
    reportId: "r-001",
    author: "mika.t",
    text: "Confirmed, nasa Estrada ako ngayon. Hanggang tuhod talaga.",
    timestamp: minsAgo(4),
  },
  {
    id: "c-002",
    reportId: "r-001",
    author: "paolo.r",
    text: "Salamat sa update! Iiwas muna ako diyan.",
    timestamp: minsAgo(3),
  },
  {
    id: "c-003",
    reportId: "r-001",
    author: "anna.cruz",
    text: "May jeep pa ba dumadaan or wala na?",
    timestamp: minsAgo(1),
  },
  {
    id: "c-004",
    reportId: "r-002",
    author: "kent.d",
    text: "Motor ko kayang-kaya pa kanina, dahan-dahan lang.",
    timestamp: minsAgo(12),
  },
  {
    id: "c-005",
    reportId: "r-002",
    author: "jules",
    text: "Mag-ingat, madulas sa gilid.",
    timestamp: minsAgo(8),
  },
  {
    id: "c-006",
    reportId: "r-005",
    author: "bea.s",
    text: "Grabe, waist-deep na nga dito. Wag na dumaan.",
    timestamp: minsAgo(20),
  },
];

export const seedAnnouncements: Announcement[] = [
  {
    id: "a-01",
    title: "Flooding on Taft Ave",
    body: "3 reports + sensor: knee-deep water. Expect heavy traffic and plan alternate routes.",
    agency: "Manila CDRRMO",
    type: "closure",
    source: "lgu",
    timestamp: minsAgo(5),
  },
  {
    id: "a-02",
    title: "Class suspension",
    body: "No classes today, Manila LGU advisory for all levels due to flooding.",
    agency: "Manila City Government",
    type: "suspension",
    source: "lgu",
    timestamp: minsAgo(22),
  },
  {
    id: "a-03",
    title: "Water level rising",
    body: "Vito Cruz sensor now at 28 cm. Residents in low-lying areas, take precautions.",
    agency: "PAGASA",
    type: "advisory",
    source: "sensor",
    timestamp: minsAgo(60),
  },
  {
    id: "a-04",
    title: "Shift to online",
    body: "DLSU-Manila classes shifted online due to flooding. Check your LMS for updates.",
    agency: "DLSU",
    type: "advisory",
    source: "school",
    timestamp: minsAgo(120),
  },
];

export const seedSocial: SocialPost[] = [
  {
    id: "p-01",
    platform: "facebook",
    author: "Taft Ave Commuters PH",
    text: "Grabe baha sa Agno ngayon, waist-deep na. Umikot na lang kayo sa Leon Guinto.",
    link: "https://facebook.com",
    timestamp: minsAgo(9),
  },
  {
    id: "p-02",
    platform: "x",
    author: "@dlsutraffic",
    text: "Taft x Vito Cruz: tuhod-deep, dahan-dahan ang jeep pero dumadaan pa. #BahaUpdate",
    link: "https://x.com",
    timestamp: minsAgo(13),
  },
  {
    id: "p-03",
    platform: "reddit",
    author: "u/manila_commuter",
    text: "Anyone know if Estrada is passable right now? Need to get to Taft.",
    link: "https://reddit.com",
    timestamp: minsAgo(19),
  },
  {
    id: "p-04",
    platform: "facebook",
    author: "DLSU Student Updates",
    text: "Walk na lang muna kung malapit, baha sa Dagonoy side. Ingat mga Lasallians!",
    link: "https://facebook.com",
    timestamp: minsAgo(26),
  },
  {
    id: "p-05",
    platform: "x",
    author: "@mmda",
    text: "Flooding reported along Taft Ave. Motorists advised to take alternate routes. Updates to follow.",
    link: "https://x.com",
    timestamp: minsAgo(37),
  },
];
