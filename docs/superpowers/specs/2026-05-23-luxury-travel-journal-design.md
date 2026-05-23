# Voyages — Luxury Travel Journal: Design Spec

**Date:** 2026-05-23  
**Status:** Approved  
**Phase:** 1 (no auth)

---

## Product Vision

A cinematic, editorial travel platform for documenting personal journeys and exploring the 184 Most Beautiful Villages of France. Positioned as a private luxury travel archive — closer to Condé Nast Traveler than a SaaS dashboard.

Not a booking platform. Not a tourism office. A personal atlas.

---

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 14, App Router, TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Maps | Leaflet + MapTiler (Positron/Basic — ivory atlas tiles) |
| Database | Supabase (Postgres) |
| File storage | Supabase Storage |
| Fonts | Cormorant Garamond (serif headlines), Inter (UI sans) |
| Deployment | Vercel |

**Auth:** Deferred to phase 2. Phase 1 writes to Supabase without user accounts. Supabase Auth + RLS policies added in phase 2 with no structural changes to the schema.

---

## Design Language

### Palette

| Token | Hex | Usage |
|---|---|---|
| `deep-blue` | `#163A70` | Primary — nav, markers, headings on light |
| `cobalt` | `#1F4EA3` | Secondary blue, borders |
| `petroleum` | `#234A6B` | Gradient fills |
| `ivory` | `#F7F5F1` | Page background (light mode) |
| `sand` | `#DCC9A3` | Borders, card backgrounds |
| `stone` | `#C8CDD4` | Muted text, unvisited markers |
| `midnight` | `#0D1B2A` | Dark surfaces, nav background |
| `champagne` | `#D6C3A5` | Accents, visited state, favourites |

### Stripe Motif

Vertical repeating stripe: `#163A70` 3px / `#F7F5F1` 15–20px gap. Used as:
- Hero overlay (subtle opacity)
- Card bottom accent bar (3px height)
- Section dividers
- Feature block backgrounds (navy blocks on homepage)

CSS:
```css
background-image: repeating-linear-gradient(
  90deg,
  #163A70 0px, #163A70 3px,
  #F7F5F1 3px, #F7F5F1 18px
);
```

### Typography

- **Headlines:** Cormorant Garamond, italic, weight 400. Large, editorial, generous line-height (1.1).
- **UI / labels:** Inter. Uppercase tracking for labels (`letter-spacing: 0.2em`). Small sizes (8–11px for captions).
- **Body / memories:** Cormorant Garamond regular, 16–18px, generous line-height (1.8).

### Motion

All via Framer Motion. No bounce. No spring on UI elements.

| Element | Animation |
|---|---|
| Page enter | `opacity 0→1, y +16→0`, 0.5s, ease `[0.25,0.1,0.25,1]` |
| Card hover | `scale 1→1.02`, shadow lift, 0.3s |
| Map marker hover | `scale 1→1.4`, label fade in, 0.2s |
| Photo gallery | Staggered children, 0.08s delay between items |
| Hero parallax | `useScroll` + `useTransform`, photo at 0.3× scroll speed |
| Nav background | Opacity 0→1 on scroll past hero, `rgba(13,27,42,0.96)` |
| Loading shimmer | Horizontal shimmer sweep, no spinners |

---

## Pages & Routes

```
/                          Homepage
/villages                  Villages map + search + grid
/villages/[slug]           Individual village page
/journeys                  Journey collection
/journeys/new              Create journey
/journeys/[id]             Journey detail
/journeys/[id]/memory/new  Add memory to journey
/itineraries               Itinerary generator
/itineraries/[id]          Generated itinerary view
```

---

## Page Designs

### Homepage `/`

**Hero (Asymmetric Atlas):**
- Photo covers 70% right, bleeds to edge
- Soft gradient bleeds left into ivory
- Subtle vertical stripe wash behind left panel (12% opacity)
- Left column: eyebrow label, italic serif headline ("Beautiful Journeys"), rule, sub-caption, CTA link with underline
- Circular badge bottom-right of photo: "184 / Villages"
- Transparent nav floats over hero; transitions to `rgba(13,27,42,0.96)` on scroll

**Below hero — 3 feature blocks (full width, equal height ~220px):**
1. **Design a Journey** — navy background, stripe overlay, italic serif label, CTA
2. **184 Villages of France** — champagne/sand background, map thumbnail, label
3. **Plan an Itinerary** — ivory, editorial description, link

---

### Villages `/villages`

**Layout:** Full-screen split — Leaflet map (60% width) + right panel (40%)

**Map:**
- MapTiler Positron (ivory atlas) tiles
- 184 markers: 8px dots, navy fill if visited, ring-only if unvisited
- Marker hover: scale + italic label fade in
- Click: right panel scrolls to + highlights that village card
- Controls: zoom (+/−), region filter pills above map

**Right panel:**
- Search input (Inter, generous padding, sand border)
- Filter chips: by region, by visited/unvisited
- Village cards: Portrait Editorial (card A from design) in scrollable list
  - Tall portrait photo
  - Region eyebrow
  - Italic village name
  - Department + visited date (if visited)
  - Champagne stripe accent at card bottom (navy if visited, stone if not)
  - Champagne check badge top-right if visited

---

### Village Page `/villages/[slug]`

- Full-width hero photo (100vw, 65vh), transparent nav over it
- Below: two-column — left editorial text (name, region, description, visited toggle), right: personal photos upload + display
- Visited toggle: minimal button, navy fill when active, champagne glow animation on toggle
- Personal notes textarea: Cormorant body, no border, placeholder "Your memories of this village…"
- Nearby villages: horizontal scroll of portrait cards
- No gamification, no badges beyond the visited check

---

### Journeys `/journeys`

Masonry-inspired grid of journey cards:
- Large hero image (varies height)
- Italic serif title overlay
- Year badge (champagne pill)
- Destination label

---

### Create Journey `/journeys/new`

Form styled as luxury notebook opening:
- Fields: Title (large Cormorant input), Year, Destination, Hero image upload
- No dense UI — one field per visual block, generous spacing
- Submit creates Supabase record + redirects to `/journeys/[id]`

---

### Journey Detail `/journeys/[id]`

- Full-width hero photo
- Below: title, year, destination, editorial intro notes
- Leaflet map showing all memory locations as stops, connected by dashed navy polyline
- Memory timeline: chronological, each memory is a `MemoryBlock`
  - Italic title
  - Cormorant body text
  - Location label
  - Attached photo strip (horizontal scroll)
- FAB (floating): "+ Add Memory" — navy circle, bottom right

---

### Add Memory `/journeys/[id]/memory/new`

- Full-page form: title, notes (large textarea), location picker (map click or text), photo upload (multi)
- Same luxury notebook aesthetic as journey creator

---

### Itinerary Generator `/itineraries`

**Left panel — inputs:**
- Number of days (2–10, large typographic slider)
- Departure region (dropdown, editorial style)
- Travel style (multi-select pills): Slow Luxury / Gastronomy Escape / Wine Journey / Mediterranean Escape / Hidden Villages / Romantic Journey / Photography Route / Coastal Villages / Architectural Discovery
- Pace: Slow / Moderate / Intensive
- Already visited villages excluded toggle

**Right panel — live preview:**
- Updates as user adjusts inputs
- Shows rough village sequence as editorial list
- "Generate Itinerary" CTA → creates Supabase record, redirects to `/itineraries/[id]`

---

### Itinerary Detail `/itineraries/[id]`

Magazine two-column layout:
- Left: Leaflet route map, champagne polyline with stop markers
- Right: Scrollable village sequence grouped by day
  - Day header: italic day label + atmosphere descriptor
  - Village entry: name, drive time from previous, style tags, description excerpt
- Hero image: first village's photo, full-width
- Print-ready layout (CSS `@media print`)

---

## Data Model

### Static Data

```
/data/villages.json
```

Each entry:
```json
{
  "slug": "gordes",
  "name": "Gordes",
  "region": "Provence-Alpes-Côte d'Azur",
  "department": "Vaucluse",
  "lat": 43.9117,
  "lng": 5.2011,
  "description": "...",
  "tags": ["provence", "medieval", "gastronomy", "photography"],
  "heroImage": "https://..."
}
```

Tags used by itinerary generator for filtering and weighting.

### Supabase Tables

```sql
journeys (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  year        integer,
  destination text,
  hero_image_url text,
  notes       text,
  created_at  timestamptz default now()
)

memories (
  id            uuid primary key default gen_random_uuid(),
  journey_id    uuid references journeys(id) on delete cascade,
  title         text,
  body          text,
  location_name text,
  lat           numeric,
  lng           numeric,
  created_at    timestamptz default now()
)

memory_photos (
  id           uuid primary key default gen_random_uuid(),
  memory_id    uuid references memories(id) on delete cascade,
  storage_url  text not null,
  caption      text,
  sort_order   integer default 0
)

visited_villages (
  id            uuid primary key default gen_random_uuid(),
  village_slug  text not null unique,  -- phase 2: change to UNIQUE(user_id, village_slug) when auth added
  visited_at    date,
  personal_note text
)

itineraries (
  id           uuid primary key default gen_random_uuid(),
  title        text,
  days         integer,
  style        text[],
  village_slugs text[],
  created_at   timestamptz default now()
)
```

### Supabase Storage Buckets

```
journey-heroes    — one per journey, public read
memory-photos     — multiple per memory, public read
```

---

## Component Inventory

### Layout
- `NavBar` — transparent → midnight on scroll, Framer opacity transition
- `PageTransition` — Framer fade wrapper on all pages
- `StripeAccent` — reusable stripe div (horizontal or vertical orientation)
- `ShimmerLoader` — slow shimmer placeholder, replaces spinners everywhere

### Village
- `VillageCard` — portrait editorial: photo fill, overlay text, stripe bottom, visited badge
- `VillageMap` — Leaflet wrapper, ivory tiles, marker cluster at low zoom
- `VillageMarker` — navy (visited) / ring-only (unvisited) states, hover scale + label

### Journey
- `JourneyCard` — hero image, italic title overlay, year badge, champagne stripe
- `MemoryBlock` — editorial memory: title, body, location, photo strip
- `JourneyMap` — Leaflet with dashed polyline route, stop markers

### Itinerary
- `ItineraryLayout` — two-column magazine: map left, sequence right
- `DayBlock` — day header + village entries
- `RouteMap` — Leaflet, champagne route line, numbered stop markers

### Shared
- `PhotoGallery` — masonry, Framer staggered reveal
- `HeroImage` — full-bleed, parallax via `useScroll`
- `EditorialForm` — luxury notebook form style: large inputs, generous spacing
- `VisitedToggle` — minimal button, navy active state, champagne glow animation

---

## Itinerary Algorithm (Phase 1, No AI)

```
Input: days (int), region (string), styles (string[]), pace (slow|moderate|intensive)

1. Filter villages.json where tags intersect styles
2. If region specified, prioritise villages in/near that region (haversine < 200km)
3. Sort remaining by cluster density (group nearby villages)
4. Assign villages per day: slow=2, moderate=3, intensive=4
5. For each consecutive pair, compute haversine distance → estimate drive time (60km/h avg)
6. Output: { days: [{ label, villages: [{ slug, driveTimeFromPrev }] }] }
```

Phase 2: replace step 6 description generation with Claude API (claude-sonnet-4-6) for atmosphere prose.

---

## Phase 2 Additions (Out of Scope Now)

- Supabase Auth (email/magic link) + RLS
- Claude API for itinerary atmosphere descriptions
- Village data enrichment (Wikipedia API, Unsplash)
- Dark mode (deep navy palette variant)
- Mobile app (React Native or PWA)

---

## Non-Goals (Phase 1)

- Booking, affiliate links, or commerce
- Social features (sharing, following, comments from others)
- User accounts or authentication
- Offline support
- i18n beyond French village names in data
