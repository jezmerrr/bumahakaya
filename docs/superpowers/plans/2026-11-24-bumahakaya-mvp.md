# BumahaKaya? MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first Next.js web app that lets someone around DLSU-Manila see current flood conditions on a map, read official announcements, and submit their own flood report.

**Architecture:** Single Next.js (App Router) app, no backend. Domain types and pure logic (severity colors, geo distance, relative time) are unit-tested. A React context store holds reports/sensors/announcements/social posts, seeded from static data and persisted to `localStorage`; user submissions merge into it. The UI is a tabbed mobile shell over five sections (Map, Feed, Report, Announcements, Updates). The map uses react-leaflet, loaded client-only via dynamic import.

**Tech Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · react-leaflet v5 + Leaflet + OpenStreetMap tiles · Vitest + React Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-24-bumahakaya-mvp-design.md`

## Global Constraints

- No API keys or paid services; map tiles from OpenStreetMap only.
- Every seeded/mock item (report `source: sensor`, announcement, social post) renders a visible **"Demo data"** label.
- The app displays a disclaimer that it is a **supplementary source and does not replace PAGASA / LGU advisories**.
- Anonymous only — no accounts, no login, no personal-info fields. User content is limited to photo + note.
- User-submitted reports persist to `localStorage` and survive reload within the browser.
- Must run with `npm run dev` and `npm run build` with no extra config; deployable to Vercel unchanged.
- Severity enum (exact): `Passable` (green `#16a34a`), `Caution` (orange `#ea580c`), `Impassable` (red `#dc2626`). Water level enum (exact): `Ankle`, `Knee`, `Waist+`.
- Any component using Leaflet or `window` must be client-only (`"use client"` + dynamic import with `ssr: false`); verify with `npm run build`, not only `tsc`.

## Review Focus

- **Report with no photo and no note** (both optional) — still saves and appears on map + feed. → Task 7.
- **First visit / empty or corrupted `localStorage`** — app loads seed data and never throws on parse failure. → Task 3.
- **Geolocation denied or unavailable** — "use my location" falls back to the default DLSU coordinate without breaking the form. → Task 7.
- **Nearby banner when user location is unknown** — banner hides gracefully, no crash. → Task 5.
- **SSR of the map** — Leaflet touching `window` during build does not break `next build` (enforced by `ssr: false`). → Task 5.

---

### Task 1: Project scaffold + test harness

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx` (via create-next-app)
- Create: `vitest.config.ts`, `vitest.setup.ts`
- Test: `lib/smoke.test.ts`

**Interfaces:**
- Produces: a runnable Next.js app and a working `npm test` (Vitest + jsdom + RTL).

- [ ] **Step 1: Scaffold the app.** Run `npx create-next-app@latest . --ts --tailwind --app --eslint --src-dir=false --import-alias "@/*" --no-turbopack` in `~/Downloads/BumahaKaya` (keep existing `docs/`).
- [ ] **Step 2: Add test deps.** Install `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`. Add `"test": "vitest run"` and `"test:watch": "vitest"` to scripts.
- [ ] **Step 3: Configure Vitest.** `vitest.config.ts` with `environment: "jsdom"`, `setupFiles: ["./vitest.setup.ts"]`, `@` alias → project root; `vitest.setup.ts` imports `@testing-library/jest-dom/vitest`.
- [ ] **Step 4: Write smoke test** `lib/smoke.test.ts`: `expect(1 + 1).toBe(2)`.
- [ ] **Step 5: Run** `npm test` → PASS. Run `npm run build` → succeeds.
- [ ] **Step 6: Commit** `chore: scaffold Next.js app + Vitest harness`.

---

### Task 2: Domain types + pure logic

**Files:**
- Create: `lib/types.ts`, `lib/severity.ts`, `lib/geo.ts`, `lib/time.ts`
- Test: `lib/severity.test.ts`, `lib/geo.test.ts`, `lib/time.test.ts`

**Interfaces:**
- Produces:
  - `type Severity = "Passable" | "Caution" | "Impassable"`
  - `type WaterLevel = "Ankle" | "Knee" | "Waist+"`
  - `type Source = "community" | "sensor" | "official"`
  - `interface Report { id: string; lat: number; lng: number; streetName: string; severity: Severity; waterLevel: WaterLevel; passable: boolean; photoUrl?: string; note?: string; source: Source; timestamp: string }`
  - `interface Announcement { id: string; title: string; body: string; agency: string; type: "suspension" | "closure" | "advisory"; timestamp: string }`
  - `interface SocialPost { id: string; platform: "facebook" | "x" | "reddit"; author: string; text: string; timestamp: string; link: string }`
  - `severityColor(s: Severity): string` → the exact hex from Global Constraints.
  - `waterLevelToSeverity(w: WaterLevel): Severity` → Ankle→Caution, Knee→Caution, Waist+→Impassable.
  - `distanceMeters(a: {lat:number;lng:number}, b: {lat:number;lng:number}): number` (haversine).
  - `reportsNearby(center: {lat:number;lng:number}, reports: Report[], radiusM: number): Report[]`.
  - `relativeTime(iso: string, now?: Date): string` → e.g. `"5m ago"`, `"2h ago"`, `"just now"`.

- [ ] **Step 1: Write failing tests.**
  - `severity.test.ts`: `severityColor("Impassable")` → `"#dc2626"`; `waterLevelToSeverity("Waist+")` → `"Impassable"`; `waterLevelToSeverity("Ankle")` → `"Caution"`.
  - `geo.test.ts`: `distanceMeters` between two known DLSU points is within tolerance of a hand-computed value; `reportsNearby` returns only reports inside `radiusM`.
  - `time.test.ts`: `relativeTime(now-5min)` → `"5m ago"`; `relativeTime(now-90min)` → `"1h ago"`; `relativeTime(now-10s)` → `"just now"`.
- [ ] **Step 2: Run** the three test files → FAIL (modules not found).
- [ ] **Step 3: Implement** `types.ts`, `severity.ts`, `geo.ts` (haversine), `time.ts`.
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat: domain types and pure flood/geo/time logic`.

---

### Task 3: Seed data + persistent store

**Files:**
- Create: `data/seed.ts` (exports `seedReports`, `seedSensors`, `seedAnnouncements`, `seedSocial`)
- Create: `lib/store.tsx` (React context provider + hook)
- Test: `lib/store.test.tsx`

**Interfaces:**
- Consumes: types from Task 2.
- Produces:
  - `seedReports: Report[]` (~8–12, `source: "community"`, on Taft/Vito Cruz/Agno/Estrada, timestamps within last few hours), `seedSensors: Report[]` (3–5, `source: "sensor"`), `seedAnnouncements: Announcement[]` (3–4), `seedSocial: SocialPost[]` (4–6).
  - `<StoreProvider>` React component.
  - `useStore(): { reports: Report[]; sensors: Report[]; announcements: Announcement[]; social: SocialPost[]; addReport(input: Omit<Report, "id" | "timestamp" | "source">): void }`.
  - On mount: hydrate `reports` from `localStorage["bk.reports.v1"]` if present, else from `seedReports`; sensors/announcements/social always come from seed. `addReport` prepends a community report (generated `id`, `timestamp = now`, `source: "community"`) and writes reports back to `localStorage`.

- [ ] **Step 1: Write failing tests** `store.test.tsx` (render a probe component inside `StoreProvider`, drive via `useStore`):
  - with empty `localStorage`, `reports.length === seedReports.length`.
  - after `addReport({...})`, `reports[0]` has the new note, a non-empty `id`, `source === "community"`, and `localStorage["bk.reports.v1"]` now contains it.
  - with `localStorage["bk.reports.v1"] = "{ broken json"`, provider still renders and falls back to `seedReports` (no throw).
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement** `data/seed.ts` and `lib/store.tsx` (guard `localStorage` access with `typeof window` and try/catch).
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat: seed data and localStorage-backed store`.

---

### Task 4: App shell, navigation, branding, disclaimer

**Files:**
- Modify: `app/layout.tsx` (wrap children in `StoreProvider`, set title "BumahaKaya?")
- Modify: `app/page.tsx` (render `<AppShell>`)
- Create: `components/AppShell.tsx`, `components/DemoDataBadge.tsx`, `components/SeverityChip.tsx`, `components/SourceBadge.tsx`
- Test: `components/AppShell.test.tsx`, `components/SeverityChip.test.tsx`

**Interfaces:**
- Consumes: `useStore`, `severityColor` (Task 2/3).
- Produces:
  - `<AppShell>`: `"use client"` tabbed shell with five tabs — Map, Feed, Report, Announcements, Updates — rendering the matching section component for the active tab via local state; mobile-first bottom nav. Renders the supplementary-source disclaimer persistently (header or footer).
  - `<DemoDataBadge>` → small "Demo data" pill.
  - `<SeverityChip severity={Severity}>` → colored chip using `severityColor`.
  - `<SourceBadge source={Source}>` → label (Community / Sensor / Official).
  - For this task, the five sections may be placeholder divs; later tasks replace them.

- [ ] **Step 1: Write failing tests.** `AppShell.test.tsx`: renders five tab controls; clicking "Report" shows the Report section (placeholder text); the disclaimer text ("does not replace PAGASA") is present. `SeverityChip.test.tsx`: renders "Impassable" and the element's style color is the red hex.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement** the shell + small presentational components; wire `StoreProvider` into `layout.tsx`.
- [ ] **Step 4: Run** → PASS. Run `npm run build` → succeeds.
- [ ] **Step 5: Commit** `feat: app shell, nav, branding, disclaimer`.

---

### Task 5: Map section (client-only Leaflet)

**Files:**
- Create: `components/MapView.tsx` (the react-leaflet map), `components/MapSection.tsx` (dynamic wrapper + nearby banner), `components/NearbyBanner.tsx`
- Modify: `app/globals.css` (import `leaflet/dist/leaflet.css`), `components/AppShell.tsx` (Map tab → `<MapSection>`)
- Test: `components/NearbyBanner.test.tsx`
- Install: `leaflet`, `react-leaflet`, `@types/leaflet`

**Interfaces:**
- Consumes: `useStore`, `reportsNearby`, `severityColor`.
- Produces:
  - `MapView` (`"use client"`): Leaflet `MapContainer` centered on DLSU (`14.5647, 120.9936`, zoom ~16), OSM `TileLayer`, one `CircleMarker` per report+sensor colored by `severityColor`, popup showing street / water level / source / relative time.
  - `MapSection`: `const MapView = dynamic(() => import("./MapView"), { ssr: false })`; renders `<NearbyBanner>` above the map.
  - `NearbyBanner`: props `{ userLocation: {lat:number;lng:number} | null; reports: Report[] }`; when `userLocation` is null → renders nothing; else counts `reportsNearby(userLocation, reports, 400)` and, if > 0, shows "⚠ Flooding reported near you (N reports)".

- [ ] **Step 1: Write failing test** `NearbyBanner.test.tsx`: `userLocation={null}` → container empty; `userLocation` near a seeded impassable report → text includes "near you".
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement** `NearbyBanner`, `MapView`, `MapSection`; import Leaflet CSS in `globals.css`; wire Map tab.
- [ ] **Step 4: Run** test → PASS. Run `npm run build` → succeeds (confirms `ssr:false` keeps Leaflet out of SSR).
- [ ] **Step 5: Commit** `feat: map section with color-coded markers and nearby banner`.

---

### Task 6: Feed section

**Files:**
- Create: `components/FeedSection.tsx`, `components/ReportCard.tsx`
- Modify: `components/AppShell.tsx` (Feed tab → `<FeedSection>`)
- Test: `components/FeedSection.test.tsx`

**Interfaces:**
- Consumes: `useStore`, `SeverityChip`, `SourceBadge`, `DemoDataBadge`, `relativeTime`.
- Produces:
  - `ReportCard`: props `{ report: Report }` — shows street, `SeverityChip`, water level, passable yes/caution/no, `SourceBadge`, relative time, photo thumbnail if `photoUrl`, and `DemoDataBadge` when `source === "sensor"`.
  - `FeedSection`: lists `[...reports, ...sensors]` sorted by `timestamp` descending as `ReportCard`s.

- [ ] **Step 1: Write failing test** `FeedSection.test.tsx`: rendered inside `StoreProvider`, shows at least the seeded reports; the most recent timestamp's card appears before an older one; a `sensor` card shows a "Demo data" badge.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement** `ReportCard` and `FeedSection`.
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat: community feed section`.

---

### Task 7: Report submission form

**Files:**
- Create: `components/ReportSection.tsx`
- Modify: `components/AppShell.tsx` (Report tab → `<ReportSection>`)
- Test: `components/ReportSection.test.tsx`

**Interfaces:**
- Consumes: `useStore` (`addReport`), `waterLevelToSeverity`, types.
- Produces:
  - `ReportSection`: form with street-name text input, water-level select (`Ankle`/`Knee`/`Waist+`), passability select (Passable / Caution / Impassable → sets `passable` and `severity`; default severity may be derived from `waterLevelToSeverity`), optional photo `<input type="file">` (converted to object URL, never uploaded), optional note textarea, and a "Use my location" button that calls `navigator.geolocation.getCurrentPosition`, falling back to the default DLSU coordinate (`14.5647, 120.9936`) on error/denied. Submit calls `addReport` and clears the form / shows a success state.

- [ ] **Step 1: Write failing tests** `ReportSection.test.tsx` (inside `StoreProvider`):
  - filling street + water level + passability and submitting **with no photo and no note** adds a report (feed count increases by 1; new report has `source: "community"`).
  - with `navigator.geolocation` stubbed to call the error callback, clicking "Use my location" does not throw and the form still submits using the default coordinate.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement** `ReportSection`.
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat: flood report submission form`.

---

### Task 8: Announcements + Updates sections

**Files:**
- Create: `components/AnnouncementsSection.tsx`, `components/UpdatesSection.tsx`
- Modify: `components/AppShell.tsx` (Announcements + Updates tabs)
- Test: `components/AnnouncementsSection.test.tsx`, `components/UpdatesSection.test.tsx`

**Interfaces:**
- Consumes: `useStore`, `DemoDataBadge`, `relativeTime`.
- Produces:
  - `AnnouncementsSection`: lists `announcements` (title, body, agency, type label, relative time), each with a `DemoDataBadge` and an "Official" marker.
  - `UpdatesSection`: lists `social` posts with a platform badge (Facebook / X / Reddit), author, text, relative time, link, and a `DemoDataBadge`.

- [ ] **Step 1: Write failing tests.** `AnnouncementsSection.test.tsx`: shows each seeded announcement's agency and a "Demo data" badge. `UpdatesSection.test.tsx`: shows a post per platform present in seed, each with its platform label.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement** both sections; wire the two tabs.
- [ ] **Step 4: Run** → PASS. Run `npm run build` → succeeds.
- [ ] **Step 5: Commit** `feat: announcements and cross-platform updates sections`.

---

### Task 9: README + final verification

**Files:**
- Create: `README.md`

**Interfaces:** none.

- [ ] **Step 1:** Write `README.md`: what BumahaKaya? is, that all non-user data is demo/mock, `npm install` / `npm run dev` / `npm test` / `npm run build`, and the supplementary-source disclaimer.
- [ ] **Step 2: Run** `npm test` (all pass) and `npm run build` (succeeds).
- [ ] **Step 3: Commit** `docs: README and MVP verification`.
