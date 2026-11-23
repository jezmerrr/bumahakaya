# BumahaKaya? — MVP Design

**Date:** 2026-11-24
**Status:** Draft for approval
**Based on:** `[CCINOV8] Group 6 Masterfile (4).pdf` (FloodWatch / BumahaKaya? business plan)

## Intent and Why

Filipinos checking whether their street is safe to travel during heavy rain
have to stitch together Facebook posts, group chats, and city-wide government
advisories — none of which answer the one question that matters: *"Is my street
flooded right now?"*

BumahaKaya? answers that question in one place, hyperlocal and commuter-focused,
starting with the streets around De La Salle University – Manila (Taft Avenue,
Vito Cruz, Agno, Estrada).

The MVP's job is to **prove the core loop works and is worth using**: open the
app → see current flood conditions on a map of your area → read official
announcements → submit your own report. Everything else in the business plan
(IoT hardware, paid dashboards, real social-media APIs, native iOS) is
deliberately out of scope for this MVP and faked with clearly-labeled demo data.

## Goals

- A **map-centric** view of the DLSU-Manila area showing flood conditions on
  specific streets, color-coded by severity.
- Users can **submit a flood report**: location, water level, road passability,
  optional photo, optional note.
- A **community feed** listing recent reports with source, location, water
  level, passability, and timestamp.
- An **announcements** section for official LGU / government advisories (class
  suspensions, road closures), clearly labeled as official.
- A **cross-platform posts** section showing flood-related posts aggregated from
  "Facebook / X / Reddit," clearly labeled by source.
- A **location-based alert banner**: "Flooding reported near you" when recent
  reports are close to the user's (mock or real) location.
- Deployable to a shareable URL (Vercel-ready) so it can be demoed in a pitch.

## Non-Goals (explicitly out of scope for the MVP)

- Real IoT water-level sensors or any hardware — sensor readings are **mock
  demo data**.
- Real integration with Facebook / X / Reddit APIs — cross-platform posts are
  **mock demo data**.
- Push notifications or background geolocation alerts — the "near you" alert is
  an **in-app banner** only.
- User accounts / authentication — reporting is **anonymous** in the MVP.
- The paid institutional dashboard, billing, tiers, or sensor-service flows.
- Native iOS app or a separate backend database.

## Anti-Goals (would make this a failure even if it technically works)

- Presenting mock data as if it were real, authoritative flood data. Every
  seeded report, sensor, announcement, and social post must carry a visible
  **"Demo data"** label, and the app must state it is a supplementary source,
  not a replacement for PAGASA / LGU advisories (per the plan's information
  disclaimer and the Data Privacy Act).
- Collecting personal information. Reports are anonymous; photos and notes are
  the only user content.
- A map so broad it stops being hyperlocal — it must feel street-level.

## Constraints

- Single codebase, no external paid services, no API keys required to run.
- Must run locally with `npm run dev` and deploy to Vercel unchanged.
- Map tiles from a free, no-key source (OpenStreetMap).
- User-submitted reports must **persist within the browser session** so the demo
  feels live.

## Approaches Considered

- **A — Mobile-web app (Next.js PWA). CHOSEN.** One responsive web app covering
  the full loop with seeded + locally-persisted data. Fastest to a shareable,
  clickable demo; one codebase; deploys anywhere; matches the familiar
  Kilala-web stack (Next.js + TS + Tailwind). Trade-off: not a "real" native app
  and no shared multi-user backend (fine for a pitch MVP).
- **B — Native iOS (SwiftUI) + small backend.** Matches the plan's "mobile app"
  literally, but needs Xcode to run/demo, is much slower to build, and is hard
  to share as a link. Rejected: too heavy for an MVP whose main purpose is
  demonstrating the concept.
- **C — Full stack (public app + paid institutional dashboard + Node/Postgres).**
  Closest to the real business model, but the dashboard, billing, and persistence
  layers are exactly what the MVP is meant to *defer* until the loop is proven.
  Rejected: overkill.

## The How (decided)

**Stack**
- Next.js (App Router) + TypeScript + Tailwind CSS.
- Map: `react-leaflet` + Leaflet with OpenStreetMap tiles (no API key).
- State: React context + `localStorage` persistence.
- Data: seed JSON files (reports, sensors, announcements, social posts); user
  submissions merge into state and persist to `localStorage`.
- No backend, no database, no auth.

**Domain model**
- **Severity** (3 levels, color-coded): `Passable` (green), `Caution` (orange),
  `Impassable` (red).
- **Water level**: `Ankle`, `Knee`, `Waist+`.
- **Report**: `id, lat, lng, streetName, severity, waterLevel, passable,
  photoUrl?, note?, source (community | sensor | official), timestamp`.
- **Announcement**: `id, title, body, agency, type (suspension | closure |
  advisory), timestamp`.
- **SocialPost**: `id, platform (facebook | x | reddit), author, text, timestamp,
  link`.

**Screens / sections** (bottom-nav or tabbed, mobile-first)
1. **Map (home):** Leaflet map centered on DLSU Manila; color-coded markers for
   community reports + mock sensors; tap a marker → detail popup. A persistent
   "near you" alert banner when nearby reports exist.
2. **Feed:** chronological list of reports with source badge, severity chip,
   water level, street, relative timestamp, optional photo thumbnail.
3. **Report (submit):** choose location (tap map or "use my location"), pick
   water level + passability, optional photo (object URL, not uploaded anywhere),
   optional note; on submit, appears immediately on map + feed.
4. **Announcements:** official advisories list, each labeled with issuing agency.
5. **Updates (cross-platform):** mock Facebook/X/Reddit posts, each with a
   platform badge and "Demo data" label.

**Seed data:** ~8–12 reports, 3–5 sensors, 3–4 announcements, 4–6 social posts,
all plausibly placed on Taft Ave / Vito Cruz / Agno / Estrada, each timestamped
within the last few hours.

**Branding:** name "BumahaKaya?", flood/water palette (blues + severity red/
orange/green). Light, clean, mobile-first.

## Left to the Builder

- Exact component breakdown and file layout within the Next.js app.
- Precise seed coordinates and copy for demo reports/announcements/posts.
- Visual polish (icons, marker styling, empty states, loading states).
- Whether the "use my location" button uses the real Geolocation API (with a
  graceful fallback to a mocked DLSU location) or is mocked outright — builder's
  call; real-with-fallback preferred.
- `localStorage` schema/versioning details.

## Out-of-Scope Follow-ups (post-MVP, from the business plan)

Real IoT sensor ingestion, real social-platform APIs, push/geo notifications,
accounts, the paid institutional dashboard and billing tiers, native iOS app,
predictive flood analytics.
