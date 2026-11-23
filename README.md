# BumahaKaya? — *Alamin bago lumusong.*

Hyperlocal flood updates for the streets around **De La Salle University – Manila**
(Taft Ave, Vito Cruz, Agno, Estrada). BumahaKaya? answers one question a commuter
asks during heavy rain: **"Is my street flooded right now?"** — by bringing
community reports, flood sensors, official advisories, and social-media posts into
one place.

This is an **MVP** (by FloodWatch). It is mobile-first web app.

## Features

- **Map** — a live map of the DLSU area with color-coded markers:
  green = *madadaanan / passable*, amber = *mag-ingat / gutter-deep*,
  red = *hindi madaanan / not passable*. A banner warns when flooding is reported
  near you.
- **Feed** — community reports and sensor readings, newest first.
- **Report** — submit a flood report anonymously: street, water level, road status,
  optional photo and note.
- **Announcements** — official LGU / government advisories, labeled by agency.
- **Updates** — flood-related posts from Facebook, X, and Reddit in one feed.

## ⚠️ Demo / data disclaimer

All sensor readings, announcements, and social-media posts in this MVP are
**demo data** and are labeled as such in the UI. Community reports you submit are
stored **only in your browser** (`localStorage`) — nothing is uploaded and no
account is required.

BumahaKaya? is a **supplementary source and does not replace** official warnings
from **PAGASA**, LGUs, or disaster-response agencies.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm test         # unit + component tests (Vitest)
npm run build    # production build
```

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
react-leaflet + Leaflet + OpenStreetMap tiles (no API key) · Vitest +
React Testing Library.

## Project layout

- `app/` — layout, page, global styles, brand fonts.
- `components/` — app shell, tabbed sections (map, feed, report, announcements,
  updates), and brand components.
- `lib/` — domain types and pure logic (severity, geo, time) + the
  `localStorage`-backed store.
- `data/seed.ts` — demo reports, sensors, announcements, and social posts.
