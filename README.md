# BumahaKaya? — *Alamin bago lumusong.*

Hyperlocal flood updates for the streets around **De La Salle University – Manila**
(Taft Ave, Vito Cruz, Agno, Estrada). BumahaKaya? answers one question a commuter
asks during heavy rain: **"Is my street flooded right now?"** — by bringing
community reports, flood sensors, official advisories, and social-media posts into
one place.

This is an **MVP** (by FloodWatch): a mobile-first web app, live at
https://bumahakaya.pages.dev.

## Features

- **Home** — a status card that answers "is it safe near me?" (how many roads are
  not passable, the one street to avoid, a mini map, quick stats), then the feed:
  search by street or keyword, filter by source and road condition, photo posts
  (a blurred peek in the feed, the full photo when you open it), and a sideways
  row of posts from Facebook, X, and Reddit.
- **Post details** — full photo with credit, an animated flood scene that matches
  the water depth and road condition, flood details, **Show on map**, Confirm
  (saved, one vote per person, not on your own reports), and comments. Your own
  reports have edit (pencil) and delete (trash) buttons.
- **Map** — a full-screen map of the DLSU area: color-coded pins
  (green = *madadaanan / passable*, amber = *mag-ingat / gutter-deep*,
  red = *hindi madaanan / not passable*), sensor pins, road-condition filters,
  a summary card, a preview card for the tapped pin, and a list view.
- **Report** — submit a flood report: street, a map pin (your location or picked
  on the map), water level, road condition, optional photo and description.
- **Alerts** — official advisories grouped by time (last hour / earlier today),
  filtered by category (classes, roads, water levels), labeled Official or Sensor,
  with a "flooding near you" banner.
- **Profile** — your reports, saved areas, how often others confirmed your
  reports, and **Appearance**: light, dark, or follow the device.

## ⚠️ Demo / data disclaimer

All sensor readings, announcements, and social-media posts in this MVP are
**demo data** and are labeled as such in the UI. Community reports you submit (including
photos, saved as compressed copies), comments, and confirmations are stored
**only in your browser** (`localStorage`) — nothing is uploaded and no account is
required. The sample photos are credited to their owners on each post.

BumahaKaya? is a **supplementary source and does not replace** official warnings
from **PAGASA**, LGUs, or disaster-response agencies.

## Getting started

Needs **Node 22** or newer (the test runner, Vitest 5, won't run on Node 20).

```bash
npm install
npm run dev      # http://localhost:3000
```

If you edit `app/globals.css` and the change doesn't show, restart `npm run dev`.

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
- `components/` — app shell, tabbed sections (home, map, report, alerts, profile),
  post card and details, flood scene, brand components.
- `lib/` — domain types and pure logic (severity, geo, time, feed search, map
  summary, alerts, theme) + the `localStorage`-backed store.
- `data/seed.ts` — demo reports, sensors, announcements, and social posts.
