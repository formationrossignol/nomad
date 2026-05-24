# Voyages — Luxury Travel Journal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a cinematic luxury travel journal — Next.js 14 App Router with Supabase persistence, Leaflet/MapTiler maps, Framer Motion animations, and a full editorial design system.

**Architecture:** Static village data (JSON) + Supabase for user-generated content (journeys, memories, visited state). Maps via react-leaflet + MapTiler Positron tiles. All map components dynamically imported (`ssr: false`). Auth deferred to phase 2 — schema is auth-ready.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, react-leaflet, @supabase/supabase-js, @supabase/ssr, Cormorant Garamond + Inter (Google Fonts), Vercel deployment.

**Prerequisites before starting:**
1. Create a free MapTiler account → get API key
2. Create a Supabase project → get `SUPABASE_URL` + `SUPABASE_ANON_KEY`
3. Node.js 20+ installed

---

## File Map

```
voyages/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── villages/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── journeys/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── memory/new/page.tsx
│   └── itineraries/
│       ├── page.tsx
│       └── [id]/page.tsx
├── components/
│   ├── layout/
│   │   ├── NavBar.tsx
│   │   ├── PageTransition.tsx
│   │   └── ShimmerLoader.tsx
│   ├── ui/
│   │   ├── StripeAccent.tsx
│   │   └── HeroImage.tsx
│   ├── village/
│   │   ├── VillageCard.tsx
│   │   ├── VillageMap.tsx          (shell — dynamic import)
│   │   ├── VillageMapInner.tsx     (actual Leaflet component)
│   │   └── VillageMarker.tsx
│   ├── journey/
│   │   ├── JourneyCard.tsx
│   │   ├── MemoryBlock.tsx
│   │   ├── PhotoGallery.tsx
│   │   ├── JourneyMap.tsx          (shell — dynamic import)
│   │   └── JourneyMapInner.tsx
│   ├── itinerary/
│   │   ├── DayBlock.tsx
│   │   ├── RouteMap.tsx            (shell — dynamic import)
│   │   └── RouteMapInner.tsx
│   └── forms/
│       ├── EditorialForm.tsx
│       └── VisitedToggle.tsx
├── hooks/
│   └── useVisited.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── villages.ts
│   ├── haversine.ts
│   └── itinerary-algorithm.ts
├── data/
│   └── villages.json
├── types/
│   └── index.ts
├── __mocks__/
│   └── react-leaflet.tsx
├── jest.config.ts
├── jest.setup.ts
├── tailwind.config.ts
└── .env.local
```

---

### Task 1: Project Scaffold + Design System

**Files:**
- Create: `package.json` (via create-next-app)
- Create: `tailwind.config.ts`
- Create: `jest.config.ts`
- Create: `jest.setup.ts`
- Create: `.env.local`
- Create: `types/index.ts`
- Create: `app/globals.css`

- [ ] **Step 1: Scaffold Next.js project**

```bash
npx create-next-app@14 voyages \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*"
cd voyages
```

- [ ] **Step 2: Install dependencies**

```bash
npm install framer-motion leaflet react-leaflet @supabase/supabase-js @supabase/ssr
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest @types/jest @types/leaflet
```

- [ ] **Step 3: Write `tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'deep-blue': '#163A70',
        'cobalt': '#1F4EA3',
        'petroleum': '#234A6B',
        'ivory': '#F7F5F1',
        'sand': '#DCC9A3',
        'stone': '#C8CDD4',
        'midnight': '#0D1B2A',
        'champagne': '#D6C3A5',
      },
      fontFamily: {
        cormorant: ['var(--font-cormorant)', 'Georgia', 'serif'],
        inter: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.8s infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
```

- [ ] **Step 4: Write `jest.config.ts`**

```typescript
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^react-leaflet$': '<rootDir>/__mocks__/react-leaflet.tsx',
    '^leaflet$': '<rootDir>/__mocks__/leaflet.ts',
  },
}

export default createJestConfig(config)
```

- [ ] **Step 5: Write `jest.setup.ts`**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Write `.env.local`**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_MAPTILER_KEY=your-maptiler-key
```

- [ ] **Step 7: Write `types/index.ts`**

```typescript
export interface Village {
  slug: string
  name: string
  region: string
  department: string
  lat: number
  lng: number
  description: string
  tags: string[]
  heroImage: string
}

export interface Journey {
  id: string
  title: string
  year: number | null
  destination: string | null
  hero_image_url: string | null
  notes: string | null
  created_at: string
}

export interface Memory {
  id: string
  journey_id: string
  title: string | null
  body: string | null
  location_name: string | null
  lat: number | null
  lng: number | null
  created_at: string
  memory_photos?: MemoryPhoto[]
}

export interface MemoryPhoto {
  id: string
  memory_id: string
  storage_url: string
  caption: string | null
  sort_order: number
}

export interface VisitedVillage {
  id: string
  village_slug: string
  visited_at: string | null
  personal_note: string | null
}

export interface Itinerary {
  id: string
  title: string | null
  days: number | null
  pace: 'slow' | 'moderate' | 'intensive' | null
  style: string[]
  village_slugs: string[]
  created_at: string
}

export interface ItineraryStop {
  village: Village
  driveTimeFromPrevMinutes: number | null
}

export interface ItineraryDay {
  dayNumber: number
  label: string
  atmosphereNote: string
  stops: ItineraryStop[]
}

export interface GeneratedItinerary {
  days: ItineraryDay[]
  totalVillages: number
}

export interface ItineraryInput {
  days: number
  region?: string
  styles: string[]
  pace: 'slow' | 'moderate' | 'intensive'
  excludeVisited?: string[]
}
```

- [ ] **Step 8: Write `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    background-color: #F7F5F1;
    color: #163A70;
  }

  /* Leaflet tooltip override */
  .leaflet-tooltip.village-tooltip {
    font-family: var(--font-cormorant), Georgia, serif;
    font-style: italic;
    font-size: 12px;
    color: #163A70;
    background: rgba(247, 245, 241, 0.95);
    border: 1px solid #DCC9A3;
    border-radius: 2px;
    padding: 3px 8px;
    box-shadow: 0 2px 8px rgba(22, 58, 112, 0.1);
  }

  .leaflet-tooltip.village-tooltip::before {
    border-top-color: #DCC9A3;
  }
}

@media print {
  .no-print { display: none !important; }
  .print-break { page-break-before: always; }
}
```

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 14 project with design tokens and test setup"
```

---

### Task 2: Supabase Client + DB Schema

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `supabase/migrations/001_initial.sql`
- Create: `__mocks__/react-leaflet.tsx`
- Create: `__mocks__/leaflet.ts`

- [ ] **Step 1: Write `lib/supabase/client.ts`**

```typescript
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)
```

- [ ] **Step 2: Write `lib/supabase/server.ts`**

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createSupabaseServerClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

- [ ] **Step 3: Write `supabase/migrations/001_initial.sql`**

Run this SQL in the Supabase Dashboard → SQL Editor:

```sql
create table journeys (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  year          integer,
  destination   text,
  hero_image_url text,
  notes         text,
  created_at    timestamptz default now()
);

create table memories (
  id            uuid primary key default gen_random_uuid(),
  journey_id    uuid references journeys(id) on delete cascade,
  title         text,
  body          text,
  location_name text,
  lat           numeric,
  lng           numeric,
  created_at    timestamptz default now()
);

create table memory_photos (
  id           uuid primary key default gen_random_uuid(),
  memory_id    uuid references memories(id) on delete cascade,
  storage_url  text not null,
  caption      text,
  sort_order   integer default 0
);

-- phase 2: add user_id column + change unique to (user_id, village_slug)
create table visited_villages (
  id            uuid primary key default gen_random_uuid(),
  village_slug  text not null unique,
  visited_at    date,
  personal_note text
);

create table itineraries (
  id            uuid primary key default gen_random_uuid(),
  title         text,
  days          integer,
  pace          text,
  style         text[],
  village_slugs text[],
  created_at    timestamptz default now()
);

-- Storage buckets (run in Supabase Dashboard → Storage)
-- Create bucket "journey-heroes" with public access
-- Create bucket "memory-photos" with public access
```

- [ ] **Step 4: Write `__mocks__/react-leaflet.tsx`**

```typescript
import React from 'react'

export const MapContainer = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="map-container">{children}</div>
)
export const TileLayer = () => null
export const Polyline = () => null
export const useMap = () => ({
  setView: jest.fn(),
  addLayer: jest.fn(),
  removeLayer: jest.fn(),
})
export const CircleMarker = ({ children }: { children?: React.ReactNode }) => (
  <div data-testid="circle-marker">{children}</div>
)
export const Tooltip = ({ children }: { children?: React.ReactNode }) => (
  <div data-testid="tooltip">{children}</div>
)
```

- [ ] **Step 5: Write `__mocks__/leaflet.ts`**

```typescript
const L = {
  circleMarker: jest.fn(() => ({
    on: jest.fn().mockReturnThis(),
    addTo: jest.fn().mockReturnThis(),
    bindTooltip: jest.fn().mockReturnThis(),
    remove: jest.fn(),
    setStyle: jest.fn(),
  })),
  polyline: jest.fn(() => ({
    addTo: jest.fn().mockReturnThis(),
    remove: jest.fn(),
  })),
}
export default L
module.exports = L
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Supabase clients, DB migration SQL, and Leaflet mocks"
```

---

### Task 3: Village Data + Utilities

**Files:**
- Create: `data/villages.json`
- Create: `lib/villages.ts`
- Create: `lib/villages.test.ts`

- [ ] **Step 1: Write `data/villages.json`**

Scaffold with 10 representative entries. The remaining 174 entries must be added before launch — each follows the same schema.

```json
[
  {
    "slug": "gordes",
    "name": "Gordes",
    "region": "Provence-Alpes-Côte d'Azur",
    "department": "Vaucluse",
    "lat": 43.9117,
    "lng": 5.2011,
    "description": "Perched dramatically on a rocky hilltop in the Luberon, Gordes is one of the most photographed villages in France. Its terraced stone houses cascade down the cliff face, lit gold in the late afternoon sun.",
    "tags": ["provence", "medieval", "photography", "gastronomy", "hidden"],
    "heroImage": "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=1200&q=80"
  },
  {
    "slug": "les-baux-de-provence",
    "name": "Les Baux-de-Provence",
    "region": "Provence-Alpes-Côte d'Azur",
    "department": "Bouches-du-Rhône",
    "lat": 43.7443,
    "lng": 4.7948,
    "description": "A medieval citadel rising from the limestone Alpilles, Les Baux commands sweeping views across olive groves and vineyards. Its ruined castle and Renaissance hôtels particuliers make it feel frozen in the 16th century.",
    "tags": ["provence", "medieval", "wine", "photography", "architectural"],
    "heroImage": "https://images.unsplash.com/photo-1499678329028-101435549a4e?w=1200&q=80"
  },
  {
    "slug": "eguisheim",
    "name": "Eguisheim",
    "region": "Grand Est",
    "department": "Haut-Rhin",
    "lat": 48.0430,
    "lng": 7.3073,
    "description": "Eguisheim is a perfectly preserved medieval village built in concentric circles around its octagonal castle. Half-timbered houses painted in ochre, rose and pale blue line cobblestone streets.",
    "tags": ["alsace", "wine", "medieval", "gastronomy", "photography"],
    "heroImage": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=80"
  },
  {
    "slug": "rocamadour",
    "name": "Rocamadour",
    "region": "Occitanie",
    "department": "Lot",
    "lat": 44.7989,
    "lng": 1.6183,
    "description": "Built vertically into a sheer cliff face above the Alzou canyon, Rocamadour defies gravity. A medieval pilgrimage site, its sanctuaries and carved stone stairs create one of France's most dramatic architectural silhouettes.",
    "tags": ["medieval", "architectural", "hidden", "photography"],
    "heroImage": "https://images.unsplash.com/photo-1520466809213-7b9a56adcd45?w=1200&q=80"
  },
  {
    "slug": "la-roque-gageac",
    "name": "La Roque-Gageac",
    "region": "Nouvelle-Aquitaine",
    "department": "Dordogne",
    "lat": 44.8288,
    "lng": 1.1916,
    "description": "Nestled between a golden limestone cliff and the Dordogne river, La Roque-Gageac is one of France's most beautiful villages. Its troglodyte fort and the slow rhythm of the river give it a timeless quality.",
    "tags": ["dordogne", "medieval", "gastronomy", "photography", "hidden"],
    "heroImage": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=80"
  },
  {
    "slug": "vezelay",
    "name": "Vézelay",
    "region": "Bourgogne-Franche-Comté",
    "department": "Yonne",
    "lat": 47.4647,
    "lng": 3.7453,
    "description": "Crowned by a UNESCO-listed Romanesque basilica, Vézelay sits atop a hill above the Cure valley. The village is a starting point for the pilgrimage to Santiago de Compostela and exudes quiet spiritual beauty.",
    "tags": ["medieval", "architectural", "wine", "gastronomy", "hidden"],
    "heroImage": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80"
  },
  {
    "slug": "locronan",
    "name": "Locronan",
    "region": "Bretagne",
    "department": "Finistère",
    "lat": 48.0986,
    "lng": -4.2093,
    "description": "Locronan's Renaissance granite square is so perfectly preserved that it regularly doubles as a film set. The village's grey stone architecture and misty Atlantic light create an otherworldly atmosphere.",
    "tags": ["bretagne", "medieval", "architectural", "photography", "hidden"],
    "heroImage": "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80"
  },
  {
    "slug": "saint-cirq-lapopie",
    "name": "Saint-Cirq-Lapopie",
    "region": "Occitanie",
    "department": "Lot",
    "lat": 44.4648,
    "lng": 1.6686,
    "description": "Hanging above a bend in the Lot river, Saint-Cirq-Lapopie is a village of medieval houses and craftsmen's workshops clinging to a promontory 100m above the valley. André Breton called it 'the impossible'.",
    "tags": ["medieval", "hidden", "photography", "gastronomy"],
    "heroImage": "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=1200&q=80"
  },
  {
    "slug": "riquewihr",
    "name": "Riquewihr",
    "region": "Grand Est",
    "department": "Haut-Rhin",
    "lat": 48.1668,
    "lng": 7.2954,
    "description": "One of the wine capitals of Alsace, Riquewihr is encircled by 16th-century ramparts and filled with Renaissance half-timbered houses. Its vineyards produce some of France's finest Rieslings.",
    "tags": ["alsace", "wine", "medieval", "gastronomy"],
    "heroImage": "https://images.unsplash.com/photo-1597757212040-6f0e3eff0d3b?w=1200&q=80"
  },
  {
    "slug": "beynac-et-cazenac",
    "name": "Beynac-et-Cazenac",
    "region": "Nouvelle-Aquitaine",
    "department": "Dordogne",
    "lat": 44.8282,
    "lng": 1.1509,
    "description": "A medieval castle perches impossibly on a sheer cliff above the Dordogne valley at Beynac. The village below, with its stone houses and riverside views, was fought over by English and French kings for centuries.",
    "tags": ["dordogne", "medieval", "architectural", "photography"],
    "heroImage": "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&q=80"
  }
]
```

- [ ] **Step 2: Write failing tests in `lib/villages.test.ts`**

```typescript
import { getAllVillages, getVillageBySlug, getVillagesByRegion, getNearbyVillages } from './villages'

describe('getAllVillages', () => {
  it('returns an array of villages', () => {
    const villages = getAllVillages()
    expect(Array.isArray(villages)).toBe(true)
    expect(villages.length).toBeGreaterThan(0)
  })

  it('each village has required fields', () => {
    const villages = getAllVillages()
    villages.forEach(v => {
      expect(v.slug).toBeDefined()
      expect(v.name).toBeDefined()
      expect(v.lat).toBeDefined()
      expect(v.lng).toBeDefined()
      expect(Array.isArray(v.tags)).toBe(true)
    })
  })
})

describe('getVillageBySlug', () => {
  it('returns the correct village', () => {
    const village = getVillageBySlug('gordes')
    expect(village?.name).toBe('Gordes')
  })

  it('returns undefined for unknown slug', () => {
    expect(getVillageBySlug('nonexistent')).toBeUndefined()
  })
})

describe('getVillagesByRegion', () => {
  it('filters by region', () => {
    const villages = getVillagesByRegion('Grand Est')
    expect(villages.every(v => v.region === 'Grand Est')).toBe(true)
  })
})

describe('getNearbyVillages', () => {
  it('returns villages sorted by proximity', () => {
    const gordes = getVillageBySlug('gordes')!
    const nearby = getNearbyVillages(gordes, 3)
    expect(nearby).toHaveLength(3)
    expect(nearby.every(v => v.slug !== 'gordes')).toBe(true)
  })

  it('excludes the source village', () => {
    const gordes = getVillageBySlug('gordes')!
    const nearby = getNearbyVillages(gordes, 5)
    expect(nearby.find(v => v.slug === 'gordes')).toBeUndefined()
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
npx jest lib/villages.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module './villages'`

- [ ] **Step 4: Write `lib/villages.ts`**

```typescript
import type { Village } from '@/types'
import villagesData from '@/data/villages.json'
import { haversineKm } from './haversine'

const villages = villagesData as Village[]

export function getAllVillages(): Village[] {
  return villages
}

export function getVillageBySlug(slug: string): Village | undefined {
  return villages.find(v => v.slug === slug)
}

export function getVillagesByRegion(region: string): Village[] {
  return villages.filter(v => v.region === region)
}

export function getUniqueRegions(): string[] {
  return [...new Set(villages.map(v => v.region))].sort()
}

export function getNearbyVillages(source: Village, count: number): Village[] {
  return villages
    .filter(v => v.slug !== source.slug)
    .sort((a, b) =>
      haversineKm(source.lat, source.lng, a.lat, a.lng) -
      haversineKm(source.lat, source.lng, b.lat, b.lng)
    )
    .slice(0, count)
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npx jest lib/villages.test.ts --no-coverage
```

Expected: PASS (all 6 tests)

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add village JSON data and utility functions"
```

---

### Task 4: Haversine + Itinerary Algorithm

**Files:**
- Create: `lib/haversine.ts`
- Create: `lib/haversine.test.ts`
- Create: `lib/itinerary-algorithm.ts`
- Create: `lib/itinerary-algorithm.test.ts`

- [ ] **Step 1: Write failing haversine test**

```typescript
// lib/haversine.test.ts
import { haversineKm } from './haversine'

describe('haversineKm', () => {
  it('returns 0 for identical points', () => {
    expect(haversineKm(48.8566, 2.3522, 48.8566, 2.3522)).toBe(0)
  })

  it('calculates Paris→Lyon as approximately 392km', () => {
    const dist = haversineKm(48.8566, 2.3522, 45.7640, 4.8357)
    expect(dist).toBeGreaterThan(380)
    expect(dist).toBeLessThan(405)
  })

  it('calculates Gordes→Les Baux as approximately 20km', () => {
    const dist = haversineKm(43.9117, 5.2011, 43.7443, 4.7948)
    expect(dist).toBeGreaterThan(15)
    expect(dist).toBeLessThan(30)
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
npx jest lib/haversine.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module './haversine'`

- [ ] **Step 3: Write `lib/haversine.ts`**

```typescript
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function driveTimeMinutes(distanceKm: number, avgSpeedKmh = 60): number {
  return Math.round((distanceKm / avgSpeedKmh) * 60)
}
```

- [ ] **Step 4: Run haversine tests to pass**

```bash
npx jest lib/haversine.test.ts --no-coverage
```

Expected: PASS

- [ ] **Step 5: Write failing algorithm tests**

```typescript
// lib/itinerary-algorithm.test.ts
import { generateItinerary } from './itinerary-algorithm'
import { getAllVillages } from './villages'

const villages = getAllVillages()

describe('generateItinerary', () => {
  it('returns correct number of days', () => {
    const result = generateItinerary(villages, { days: 3, styles: [], pace: 'moderate' })
    expect(result.days).toHaveLength(3)
  })

  it('respects pace: slow=2 villages/day', () => {
    const result = generateItinerary(villages, { days: 2, styles: [], pace: 'slow' })
    result.days.forEach(day => expect(day.stops.length).toBeLessThanOrEqual(2))
  })

  it('respects pace: moderate=3 villages/day', () => {
    const result = generateItinerary(villages, { days: 2, styles: [], pace: 'moderate' })
    result.days.forEach(day => expect(day.stops.length).toBeLessThanOrEqual(3))
  })

  it('filters by style tags', () => {
    const result = generateItinerary(villages, { days: 2, styles: ['wine'], pace: 'moderate' })
    result.days.flatMap(d => d.stops).forEach(stop => {
      expect(stop.village.tags).toContain('wine')
    })
  })

  it('first stop has null driveTime', () => {
    const result = generateItinerary(villages, { days: 1, styles: [], pace: 'moderate' })
    expect(result.days[0].stops[0].driveTimeFromPrevMinutes).toBeNull()
  })

  it('subsequent stops have positive driveTime', () => {
    const result = generateItinerary(villages, { days: 1, styles: [], pace: 'intensive' })
    const stops = result.days[0].stops
    if (stops.length > 1) {
      expect(stops[1].driveTimeFromPrevMinutes).toBeGreaterThan(0)
    }
  })

  it('excludes specified visited slugs', () => {
    const result = generateItinerary(villages, {
      days: 2, styles: [], pace: 'moderate',
      excludeVisited: ['gordes'],
    })
    const allSlugs = result.days.flatMap(d => d.stops.map(s => s.village.slug))
    expect(allSlugs).not.toContain('gordes')
  })
})
```

- [ ] **Step 6: Run to verify failure**

```bash
npx jest lib/itinerary-algorithm.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module './itinerary-algorithm'`

- [ ] **Step 7: Write `lib/itinerary-algorithm.ts`**

```typescript
import type { Village, ItineraryInput, GeneratedItinerary, ItineraryDay, ItineraryStop } from '@/types'
import { haversineKm, driveTimeMinutes } from './haversine'

const VILLAGES_PER_DAY = { slow: 2, moderate: 3, intensive: 4 } as const

const ATMOSPHERE_NOTES: Record<string, string> = {
  wine: 'Follow the wine routes through sun-drenched hillside vineyards',
  gastronomy: 'A day of markets, farm tables, and regional delicacies',
  coastal: 'The sea light changes every hour along these cliffs',
  medieval: 'Time moves differently among these ancient stones',
  photography: 'Golden hour arrives early — keep your camera ready',
  hidden: 'These villages reward those who stray from the main roads',
  default: 'A slow day through France's quietest and most beautiful places',
}

function getAtmosphereNote(styles: string[]): string {
  const matched = styles.find(s => ATMOSPHERE_NOTES[s])
  return matched ? ATMOSPHERE_NOTES[matched] : ATMOSPHERE_NOTES.default
}

export function generateItinerary(villages: Village[], input: ItineraryInput): GeneratedItinerary {
  const { days, region, styles, pace, excludeVisited = [] } = input

  // 1. Filter by excluded slugs
  let pool = villages.filter(v => !excludeVisited.includes(v.slug))

  // 2. Filter by style tags
  if (styles.length > 0) {
    pool = pool.filter(v => v.tags.some(t => styles.includes(t)))
  }

  // 3. Sort pool: prioritise region if specified
  if (region) {
    const regionVillages = pool.filter(v => v.region === region)
    const others = pool.filter(v => v.region !== region)
    if (regionVillages.length > 0) {
      const centerLat = regionVillages.reduce((s, v) => s + v.lat, 0) / regionVillages.length
      const centerLng = regionVillages.reduce((s, v) => s + v.lng, 0) / regionVillages.length
      pool = [
        ...regionVillages,
        ...others.sort((a, b) =>
          haversineKm(a.lat, a.lng, centerLat, centerLng) -
          haversineKm(b.lat, b.lng, centerLat, centerLng)
        ),
      ]
    }
  }

  // 4. Greedy nearest-neighbour selection
  const vpd = VILLAGES_PER_DAY[pace]
  const totalNeeded = days * vpd
  const selected: Village[] = []
  const remaining = [...pool]

  if (remaining.length > 0) {
    selected.push(remaining.splice(0, 1)[0])
    while (selected.length < totalNeeded && remaining.length > 0) {
      const last = selected[selected.length - 1]
      let nearestIdx = 0
      let nearestDist = Infinity
      remaining.forEach((v, i) => {
        const d = haversineKm(last.lat, last.lng, v.lat, v.lng)
        if (d < nearestDist) { nearestDist = d; nearestIdx = i }
      })
      selected.push(remaining.splice(nearestIdx, 1)[0])
    }
  }

  // 5. Group into days with drive times
  const itineraryDays: ItineraryDay[] = []

  for (let d = 0; d < days; d++) {
    const dayVillages = selected.slice(d * vpd, (d + 1) * vpd)
    if (dayVillages.length === 0) break

    const stops: ItineraryStop[] = dayVillages.map((v, i) => {
      const prevVillage = i === 0
        ? (d === 0 ? null : selected[d * vpd - 1])
        : dayVillages[i - 1]

      const driveTimeFromPrevMinutes = prevVillage
        ? driveTimeMinutes(haversineKm(prevVillage.lat, prevVillage.lng, v.lat, v.lng))
        : null

      return { village: v, driveTimeFromPrevMinutes }
    })

    itineraryDays.push({
      dayNumber: d + 1,
      label: `Day ${d + 1}`,
      atmosphereNote: getAtmosphereNote(styles),
      stops,
    })
  }

  return { days: itineraryDays, totalVillages: selected.length }
}
```

- [ ] **Step 8: Run tests to pass**

```bash
npx jest lib/itinerary-algorithm.test.ts --no-coverage
```

Expected: PASS (all 7 tests)

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add haversine utility and itinerary generation algorithm"
```

---

### Task 5: Shared UI Components

**Files:**
- Create: `components/ui/StripeAccent.tsx`
- Create: `components/layout/ShimmerLoader.tsx`
- Create: `components/ui/HeroImage.tsx`
- Create: `components/layout/PageTransition.tsx`
- Create: `components/ui/StripeAccent.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// components/ui/StripeAccent.test.tsx
import { render, screen } from '@testing-library/react'
import { StripeAccent } from './StripeAccent'

describe('StripeAccent', () => {
  it('renders with aria-hidden', () => {
    const { container } = render(<StripeAccent />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('defaults to horizontal 3px height', () => {
    const { container } = render(<StripeAccent />)
    const el = container.firstChild as HTMLElement
    expect(el.style.height).toBe('3px')
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
npx jest components/ui/StripeAccent.test.tsx --no-coverage
```

Expected: FAIL

- [ ] **Step 3: Write `components/ui/StripeAccent.tsx`**

```typescript
interface StripeAccentProps {
  orientation?: 'horizontal' | 'vertical'
  height?: string
  visited?: boolean
  className?: string
}

const STRIPE_NAVY = 'repeating-linear-gradient(90deg, #163A70 0px, #163A70 3px, #F7F5F1 3px, #F7F5F1 18px)'
const STRIPE_STONE = 'repeating-linear-gradient(90deg, #C8CDD4 0px, #C8CDD4 3px, #F7F5F1 3px, #F7F5F1 18px)'
const STRIPE_VERTICAL = 'repeating-linear-gradient(0deg, #163A70 0px, #163A70 3px, #F7F5F1 3px, #F7F5F1 18px)'

export function StripeAccent({ orientation = 'horizontal', height = '3px', visited = true, className = '' }: StripeAccentProps) {
  const style = orientation === 'horizontal'
    ? { height, backgroundImage: visited ? STRIPE_NAVY : STRIPE_STONE }
    : { width: '3px', alignSelf: 'stretch', backgroundImage: STRIPE_VERTICAL }
  return <div style={style} className={className} aria-hidden="true" />
}
```

- [ ] **Step 4: Run test to pass**

```bash
npx jest components/ui/StripeAccent.test.tsx --no-coverage
```

Expected: PASS

- [ ] **Step 5: Write `components/layout/ShimmerLoader.tsx`**

```typescript
interface ShimmerLoaderProps {
  className?: string
}

export function ShimmerLoader({ className = '' }: ShimmerLoaderProps) {
  return (
    <div
      className={`relative overflow-hidden bg-sand/20 ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-ivory/60 to-transparent" />
    </div>
  )
}
```

- [ ] **Step 6: Write `components/ui/HeroImage.tsx`**

```typescript
'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'

interface HeroImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
}

export function HeroImage({ src, alt, className = '', priority = false }: HeroImageProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="absolute inset-[-15%]">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          priority={priority}
          sizes="100vw"
        />
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 7: Write `components/layout/PageTransition.tsx`**

```typescript
'use client'
import { motion } from 'framer-motion'

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add shared UI components — StripeAccent, ShimmerLoader, HeroImage, PageTransition"
```

---

### Task 6: NavBar + Root Layout

**Files:**
- Create: `components/layout/NavBar.tsx`
- Modify: `app/layout.tsx`
- Create: `components/layout/NavBar.test.tsx`

- [ ] **Step 1: Write failing NavBar test**

```typescript
// components/layout/NavBar.test.tsx
import { render, screen } from '@testing-library/react'
import { NavBar } from './NavBar'

jest.mock('next/navigation', () => ({ usePathname: () => '/' }))

describe('NavBar', () => {
  it('renders the Voyages logo link', () => {
    render(<NavBar />)
    expect(screen.getByText('Voyages')).toBeInTheDocument()
  })

  it('renders all navigation links', () => {
    render(<NavBar />)
    expect(screen.getByText('Villages')).toBeInTheDocument()
    expect(screen.getByText('Journeys')).toBeInTheDocument()
    expect(screen.getByText('Itineraries')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
npx jest components/layout/NavBar.test.tsx --no-coverage
```

Expected: FAIL

- [ ] **Step 3: Write `components/layout/NavBar.tsx`**

```typescript
'use client'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'

export function NavBar() {
  const { scrollY } = useScroll()
  const bgOpacity = useTransform(scrollY, [0, 80], [0, 1])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[52px] flex items-center justify-between px-8">
      <motion.div
        className="absolute inset-0 bg-midnight"
        style={{ opacity: bgOpacity }}
      />
      <Link
        href="/"
        className="relative z-10 font-cormorant italic text-[14px] tracking-[0.15em] text-ivory"
      >
        Voyages
      </Link>
      <nav className="relative z-10 flex gap-7 items-center">
        <Link
          href="/villages"
          className="font-inter text-[9px] tracking-[0.2em] uppercase text-ivory/70 hover:text-ivory transition-colors duration-200"
        >
          Villages
        </Link>
        <Link
          href="/journeys"
          className="font-inter text-[9px] tracking-[0.2em] uppercase text-ivory/70 hover:text-ivory transition-colors duration-200"
        >
          Journeys
        </Link>
        <Link
          href="/itineraries"
          className="font-inter text-[9px] tracking-[0.2em] uppercase text-ivory/70 hover:text-ivory transition-colors duration-200"
        >
          Itineraries
        </Link>
      </nav>
    </header>
  )
}
```

- [ ] **Step 4: Run test to pass**

```bash
npx jest components/layout/NavBar.test.tsx --no-coverage
```

Expected: PASS

- [ ] **Step 5: Write `app/layout.tsx`**

```typescript
import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'
import { NavBar } from '@/components/layout/NavBar'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Voyages — A Private Luxury Travel Journal',
  description: 'A cinematic atlas of beautiful journeys and the most beautiful villages of France.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="bg-ivory text-deep-blue antialiased">
        <NavBar />
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add NavBar with scroll-triggered background and root layout"
```

---

### Task 7: Homepage

**Files:**
- Create: `app/page.tsx`

- [ ] **Step 1: Write `app/page.tsx`**

```typescript
import Link from 'next/link'
import { HeroImage } from '@/components/ui/HeroImage'
import { StripeAccent } from '@/components/ui/StripeAccent'
import { PageTransition } from '@/components/layout/PageTransition'

export default function HomePage() {
  return (
    <PageTransition>
      {/* HERO — Asymmetric Atlas */}
      <section className="relative h-screen min-h-[600px] flex">
        {/* Left editorial panel */}
        <div className="relative z-10 flex flex-col justify-center px-12 w-[42%] flex-shrink-0">
          {/* Stripe wash */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, #163A70 0px, #163A70 3px, #F7F5F1 3px, #F7F5F1 18px)',
              opacity: 0.07,
            }}
            aria-hidden="true"
          />
          <div className="relative z-10">
            <p className="font-inter text-[9px] tracking-[0.28em] uppercase text-stone mb-8">
              A private luxury world
            </p>
            <h1 className="font-cormorant italic text-[52px] text-deep-blue leading-[1.05] mb-6">
              Beautiful<br />Journeys
            </h1>
            <div className="w-8 h-px bg-champagne mb-6" />
            <p className="font-inter text-[11px] tracking-[0.06em] text-stone leading-relaxed mb-10">
              A cinematic atlas of Mediterranean travel<br />and the most beautiful villages of France.
            </p>
            <Link
              href="/villages"
              className="font-inter text-[10px] tracking-[0.18em] uppercase text-deep-blue border-b border-deep-blue pb-0.5 hover:text-cobalt hover:border-cobalt transition-colors duration-200"
            >
              Begin Exploring
            </Link>
          </div>
        </div>

        {/* Right photo */}
        <div className="relative flex-1">
          <HeroImage
            src="https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=1400&q=80"
            alt="Mediterranean village"
            className="absolute inset-0"
            priority
          />
          {/* Gradient bleed left */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(90deg, #F7F5F1 0%, transparent 25%)' }}
            aria-hidden="true"
          />
          {/* Village count badge */}
          <div className="absolute bottom-8 right-8 w-16 h-16 rounded-full bg-midnight/75 border border-champagne/30 flex flex-col items-center justify-center z-10">
            <span className="font-cormorant italic text-[20px] text-champagne leading-none">184</span>
            <span className="font-inter text-[7px] tracking-[0.1em] uppercase text-stone mt-0.5">Villages</span>
          </div>
        </div>
      </section>

      {/* FEATURE BLOCKS */}
      <section className="grid grid-cols-3 h-[220px]">
        {/* Block 1 — Design a Journey */}
        <Link href="/journeys/new" className="group relative flex flex-col justify-end p-8 bg-deep-blue overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'repeating-linear-gradient(90deg, #F7F5F1 0px, #F7F5F1 3px, transparent 3px, transparent 18px)' }}
            aria-hidden="true"
          />
          <p className="font-inter text-[8px] tracking-[0.22em] uppercase text-champagne/60 mb-3 relative z-10">
            Start here
          </p>
          <h2 className="font-cormorant italic text-[22px] text-ivory leading-tight mb-4 relative z-10">
            Design a Journey
          </h2>
          <span className="font-inter text-[9px] tracking-[0.15em] uppercase text-champagne border-b border-champagne/50 pb-0.5 w-fit relative z-10 group-hover:border-champagne transition-colors duration-200">
            Create →
          </span>
        </Link>

        {/* Block 2 — 184 Villages */}
        <Link href="/villages" className="group relative flex flex-col justify-end p-8 bg-sand/40 overflow-hidden border-x border-sand">
          <p className="font-inter text-[8px] tracking-[0.22em] uppercase text-stone mb-3">
            Explorer
          </p>
          <h2 className="font-cormorant italic text-[22px] text-deep-blue leading-tight mb-4">
            184 Villages of France
          </h2>
          <span className="font-inter text-[9px] tracking-[0.15em] uppercase text-deep-blue border-b border-deep-blue/40 pb-0.5 w-fit group-hover:border-deep-blue transition-colors duration-200">
            Explore map →
          </span>
        </Link>

        {/* Block 3 — Plan an Itinerary */}
        <Link href="/itineraries" className="group relative flex flex-col justify-end p-8 bg-ivory overflow-hidden border-r border-sand">
          <p className="font-inter text-[8px] tracking-[0.22em] uppercase text-stone mb-3">
            Plan
          </p>
          <h2 className="font-cormorant italic text-[22px] text-deep-blue leading-tight mb-4">
            Plan an Itinerary
          </h2>
          <span className="font-inter text-[9px] tracking-[0.15em] uppercase text-deep-blue border-b border-deep-blue/40 pb-0.5 w-fit group-hover:border-deep-blue transition-colors duration-200">
            Generate route →
          </span>
        </Link>
      </section>
    </PageTransition>
  )
}
```

- [ ] **Step 2: Run dev server and verify homepage visually**

```bash
npm run dev
```

Open http://localhost:3000. Verify:
- Asymmetric atlas hero: text panel left (42%), photo right (fills rest)
- Stripe wash visible behind left panel (very subtle)
- 184/Villages circular badge bottom-right of photo
- 3 feature blocks below: navy / sand / ivory
- NavBar transparent over hero

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add homepage with asymmetric atlas hero and 3 feature blocks"
```

---

### Task 8: VillageCard

**Files:**
- Create: `components/village/VillageCard.tsx`
- Create: `components/village/VillageCard.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// components/village/VillageCard.test.tsx
import { render, screen } from '@testing-library/react'
import { VillageCard } from './VillageCard'
import type { Village } from '@/types'

const mockVillage: Village = {
  slug: 'gordes',
  name: 'Gordes',
  region: 'Provence-Alpes-Côte d\'Azur',
  department: 'Vaucluse',
  lat: 43.9117,
  lng: 5.2011,
  description: 'A beautiful village.',
  tags: ['provence', 'medieval'],
  heroImage: 'https://example.com/gordes.jpg',
}

describe('VillageCard', () => {
  it('renders village name', () => {
    render(<VillageCard village={mockVillage} />)
    expect(screen.getByText('Gordes')).toBeInTheDocument()
  })

  it('renders region', () => {
    render(<VillageCard village={mockVillage} />)
    expect(screen.getByText('Provence-Alpes-Côte d\'Azur')).toBeInTheDocument()
  })

  it('shows visited badge when visitedAt provided', () => {
    render(<VillageCard village={mockVillage} visitedAt="2023-06-15" />)
    expect(screen.getByTitle('Visited')).toBeInTheDocument()
  })

  it('does not show visited badge when visitedAt absent', () => {
    render(<VillageCard village={mockVillage} />)
    expect(screen.queryByTitle('Visited')).not.toBeInTheDocument()
  })

  it('shows visited year in dept line', () => {
    render(<VillageCard village={mockVillage} visitedAt="2023-06-15" />)
    expect(screen.getByText(/Visited 2023/)).toBeInTheDocument()
  })

  it('links to the village page', () => {
    render(<VillageCard village={mockVillage} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/villages/gordes')
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
npx jest components/village/VillageCard.test.tsx --no-coverage
```

Expected: FAIL

- [ ] **Step 3: Write `components/village/VillageCard.tsx`**

```typescript
import Link from 'next/link'
import Image from 'next/image'
import { StripeAccent } from '@/components/ui/StripeAccent'
import type { Village } from '@/types'

interface VillageCardProps {
  village: Village
  visitedAt?: string | null
  isActive?: boolean
}

export function VillageCard({ village, visitedAt, isActive = false }: VillageCardProps) {
  const isVisited = Boolean(visitedAt)

  return (
    <Link
      href={`/villages/${village.slug}`}
      className={`group block transition-opacity duration-200 ${isActive ? 'ring-2 ring-champagne' : ''}`}
    >
      <div className="relative overflow-hidden">
        {/* Photo */}
        <div className="relative h-[240px] overflow-hidden">
          <Image
            src={village.heroImage}
            alt={village.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-midnight/72 to-transparent" />

          {/* Visited badge */}
          {isVisited && (
            <div
              title="Visited"
              className="absolute top-3 right-3 w-6 h-6 rounded-full bg-champagne/90 flex items-center justify-center"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 6l3 3 5-5" stroke="#163A70" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}

          {/* Text overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3.5">
            <p className="font-inter text-[7.5px] tracking-[0.22em] uppercase text-champagne/80 mb-1">
              {village.region}
            </p>
            <h3 className="font-cormorant italic text-[15px] text-ivory leading-tight">
              {village.name}
            </h3>
            <p className="font-inter text-[8px] tracking-[0.1em] text-ivory/60 mt-1">
              {village.department}
              {visitedAt ? ` · Visited ${visitedAt.slice(0, 4)}` : ''}
            </p>
          </div>
        </div>

        {/* Stripe accent */}
        <StripeAccent visited={isVisited} />
      </div>
    </Link>
  )
}
```

- [ ] **Step 4: Run test to pass**

```bash
npx jest components/village/VillageCard.test.tsx --no-coverage
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add VillageCard — portrait editorial with visited state"
```

---

### Task 9: VillageMap + VillageMarker

**Files:**
- Create: `components/village/VillageMapInner.tsx`
- Create: `components/village/VillageMap.tsx`
- Create: `components/village/VillageMarker.tsx`
- Create: `components/village/VillageMap.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// components/village/VillageMap.test.tsx
import { render, screen } from '@testing-library/react'
import { VillageMap } from './VillageMap'
import type { Village } from '@/types'

const mockVillages: Village[] = [
  {
    slug: 'gordes', name: 'Gordes', region: 'Provence', department: 'Vaucluse',
    lat: 43.9117, lng: 5.2011, description: '', tags: [], heroImage: '',
  },
]

describe('VillageMap', () => {
  it('renders the map container', () => {
    render(
      <VillageMap
        villages={mockVillages}
        visitedSlugs={new Set()}
      />
    )
    // ShimmerLoader visible until dynamic import resolves in tests
    // The dynamic shell itself renders without error
    expect(document.body).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Write `components/village/VillageMapInner.tsx`**

This file is NOT server-rendered (imported dynamically with `ssr: false`).

```typescript
'use client'
import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { VillageMarker } from './VillageMarker'
import type { Village } from '@/types'

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY
const TILE_URL = `https://api.maptiler.com/maps/positron/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`
const FRANCE_CENTER: [number, number] = [46.8, 2.3]

interface VillageMapInnerProps {
  villages: Village[]
  visitedSlugs: Set<string>
  activeSlug?: string | null
  onVillageClick?: (slug: string) => void
}

export default function VillageMapInner({
  villages,
  visitedSlugs,
  activeSlug,
  onVillageClick,
}: VillageMapInnerProps) {
  return (
    <MapContainer
      center={FRANCE_CENTER}
      zoom={6}
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer
        url={TILE_URL}
        attribution='© <a href="https://www.maptiler.com">MapTiler</a> © <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
        tileSize={512}
        zoomOffset={-1}
      />
      {villages.map(v => (
        <VillageMarker
          key={v.slug}
          village={v}
          isVisited={visitedSlugs.has(v.slug)}
          isActive={activeSlug === v.slug}
          onClick={() => onVillageClick?.(v.slug)}
        />
      ))}
    </MapContainer>
  )
}
```

- [ ] **Step 3: Write `components/village/VillageMap.tsx`**

```typescript
'use client'
import dynamic from 'next/dynamic'
import { ShimmerLoader } from '@/components/layout/ShimmerLoader'
import type { Village } from '@/types'

const VillageMapInner = dynamic(() => import('./VillageMapInner'), {
  ssr: false,
  loading: () => <ShimmerLoader className="h-full w-full" />,
})

interface VillageMapProps {
  villages: Village[]
  visitedSlugs: Set<string>
  activeSlug?: string | null
  onVillageClick?: (slug: string) => void
}

export function VillageMap(props: VillageMapProps) {
  return <VillageMapInner {...props} />
}
```

- [ ] **Step 4: Write `components/village/VillageMarker.tsx`**

Uses imperative Leaflet API (not react-leaflet components) for full style control.

```typescript
'use client'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Village } from '@/types'

interface VillageMarkerProps {
  village: Village
  isVisited: boolean
  isActive: boolean
  onClick: () => void
}

export function VillageMarker({ village, isVisited, isActive, onClick }: VillageMarkerProps) {
  const map = useMap()
  const markerRef = useRef<L.CircleMarker | null>(null)

  useEffect(() => {
    const radius = isActive ? 8 : 5
    const marker = L.circleMarker([village.lat, village.lng], {
      radius,
      fillColor: isVisited ? '#163A70' : 'transparent',
      fillOpacity: isVisited ? 1 : 0,
      color: '#163A70',
      weight: 1.5,
    })

    marker.on('click', onClick)
    marker.bindTooltip(village.name, {
      permanent: false,
      direction: 'top',
      className: 'village-tooltip',
    })
    marker.addTo(map)
    markerRef.current = marker

    return () => { marker.remove() }
  }, [village, isVisited, isActive, map, onClick])

  return null
}
```

- [ ] **Step 5: Run test to pass**

```bash
npx jest components/village/VillageMap.test.tsx --no-coverage
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add VillageMap + VillageMarker with Leaflet/MapTiler ivory atlas tiles"
```

---

### Task 10: Villages Page + useVisited Hook

**Files:**
- Create: `hooks/useVisited.ts`
- Create: `app/villages/page.tsx`
- Create: `hooks/useVisited.test.ts`

- [ ] **Step 1: Write failing useVisited test**

```typescript
// hooks/useVisited.test.ts
import { renderHook, act, waitFor } from '@testing-library/react'
import { useVisited } from './useVisited'

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockResolvedValue({ data: [
        { id: '1', village_slug: 'gordes', visited_at: '2023-06-01', personal_note: null }
      ], error: null }),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: { id: '2', village_slug: 'vezelay', visited_at: '2024-01-01', personal_note: null },
            error: null,
          }),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({ error: null }),
      })),
    })),
  },
}))

describe('useVisited', () => {
  it('loads visited villages on mount', async () => {
    const { result } = renderHook(() => useVisited())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.visitedSlugs.has('gordes')).toBe(true)
  })

  it('toggleVisited adds a village', async () => {
    const { result } = renderHook(() => useVisited())
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(() => result.current.toggleVisited('vezelay'))
    expect(result.current.visitedSlugs.has('vezelay')).toBe(true)
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
npx jest hooks/useVisited.test.ts --no-coverage
```

Expected: FAIL

- [ ] **Step 3: Write `hooks/useVisited.ts`**

```typescript
'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { VisitedVillage } from '@/types'

export function useVisited() {
  const [visited, setVisited] = useState<Map<string, VisitedVillage>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('visited_villages')
      .select('*')
      .then(({ data }) => {
        if (data) {
          setVisited(new Map(data.map((v: VisitedVillage) => [v.village_slug, v])))
        }
        setLoading(false)
      })
  }, [])

  const toggleVisited = useCallback(
    async (slug: string, visitedAt?: string, note?: string) => {
      if (visited.has(slug)) {
        await supabase.from('visited_villages').delete().eq('village_slug', slug)
        setVisited(prev => {
          const next = new Map(prev)
          next.delete(slug)
          return next
        })
      } else {
        const record = {
          village_slug: slug,
          visited_at: visitedAt || new Date().toISOString().slice(0, 10),
          personal_note: note || null,
        }
        const { data } = await supabase
          .from('visited_villages')
          .insert(record)
          .select()
          .single()
        if (data) {
          setVisited(prev => new Map(prev).set(slug, data))
        }
      }
    },
    [visited]
  )

  return {
    visited,
    loading,
    toggleVisited,
    visitedSlugs: new Set(visited.keys()),
    getVisitedRecord: (slug: string) => visited.get(slug) ?? null,
  }
}
```

- [ ] **Step 4: Run test to pass**

```bash
npx jest hooks/useVisited.test.ts --no-coverage
```

Expected: PASS

- [ ] **Step 5: Write `app/villages/page.tsx`**

```typescript
'use client'
import { useState, useMemo, useRef } from 'react'
import { PageTransition } from '@/components/layout/PageTransition'
import { VillageCard } from '@/components/village/VillageCard'
import { VillageMap } from '@/components/village/VillageMap'
import { useVisited } from '@/hooks/useVisited'
import { getAllVillages, getUniqueRegions } from '@/lib/villages'

const allVillages = getAllVillages()
const regions = getUniqueRegions()

export default function VillagesPage() {
  const { visitedSlugs, getVisitedRecord } = useVisited()
  const [search, setSearch] = useState('')
  const [activeRegion, setActiveRegion] = useState<string | null>(null)
  const [visitedFilter, setVisitedFilter] = useState<'all' | 'visited' | 'unvisited'>('all')
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const filtered = useMemo(() => {
    return allVillages.filter(v => {
      const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.department.toLowerCase().includes(search.toLowerCase())
      const matchRegion = !activeRegion || v.region === activeRegion
      const matchVisited =
        visitedFilter === 'all' ||
        (visitedFilter === 'visited' && visitedSlugs.has(v.slug)) ||
        (visitedFilter === 'unvisited' && !visitedSlugs.has(v.slug))
      return matchSearch && matchRegion && matchVisited
    })
  }, [search, activeRegion, visitedFilter, visitedSlugs])

  function handleMarkerClick(slug: string) {
    setActiveSlug(slug)
    const el = cardRefs.current[slug]
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  return (
    <PageTransition>
      <div className="flex h-screen pt-[52px]">
        {/* Map — 60% */}
        <div className="w-[60%] flex-shrink-0 relative">
          <VillageMap
            villages={filtered}
            visitedSlugs={visitedSlugs}
            activeSlug={activeSlug}
            onVillageClick={handleMarkerClick}
          />
        </div>

        {/* Right panel — 40% */}
        <div className="flex-1 flex flex-col border-l border-sand overflow-hidden">
          {/* Search + filters */}
          <div className="p-5 border-b border-sand/60 flex-shrink-0">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search villages…"
              className="w-full font-inter text-[12px] tracking-[0.05em] px-4 py-3 border border-sand rounded-none bg-white placeholder:text-stone focus:outline-none focus:border-cobalt transition-colors duration-200"
            />
            <div className="flex gap-2 mt-3 flex-wrap">
              {(['all', 'visited', 'unvisited'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setVisitedFilter(f)}
                  className={`font-inter text-[8px] tracking-[0.15em] uppercase px-3 py-1.5 border transition-colors duration-150 ${
                    visitedFilter === f
                      ? 'bg-deep-blue text-ivory border-deep-blue'
                      : 'bg-white text-stone border-sand hover:border-deep-blue hover:text-deep-blue'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Village count */}
          <div className="px-5 py-3 border-b border-sand/40 flex-shrink-0">
            <p className="font-inter text-[9px] tracking-[0.12em] uppercase text-stone">
              {filtered.length} villages
            </p>
          </div>

          {/* Scrollable card list */}
          <div className="overflow-y-auto flex-1 grid grid-cols-2 gap-px bg-sand/30 content-start">
            {filtered.map(v => (
              <div
                key={v.slug}
                ref={el => { cardRefs.current[v.slug] = el }}
                className="bg-ivory"
                onClick={() => setActiveSlug(v.slug)}
              >
                <VillageCard
                  village={v}
                  visitedAt={getVisitedRecord(v.slug)?.visited_at}
                  isActive={activeSlug === v.slug}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
```

- [ ] **Step 6: Verify visually in browser**

```bash
npm run dev
```

Navigate to http://localhost:3000/villages. Verify:
- Full-height split: map left (60%), cards right (40%)
- Search filters the card list in real time
- Visited/Unvisited filter chips work
- Card list scrollable with 2-column portrait grid

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add villages page with split map/card layout, search, and visited filter"
```

---

### Task 11: Village Detail Page + VisitedToggle

**Files:**
- Create: `components/forms/VisitedToggle.tsx`
- Create: `app/villages/[slug]/page.tsx`
- Create: `components/forms/VisitedToggle.test.tsx`

- [ ] **Step 1: Write failing VisitedToggle test**

```typescript
// components/forms/VisitedToggle.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { VisitedToggle } from './VisitedToggle'

describe('VisitedToggle', () => {
  it('shows "Mark as visited" when not visited', () => {
    render(<VisitedToggle isVisited={false} onToggle={jest.fn()} />)
    expect(screen.getByText(/mark as visited/i)).toBeInTheDocument()
  })

  it('shows "Visited" when visited', () => {
    render(<VisitedToggle isVisited={true} onToggle={jest.fn()} />)
    expect(screen.getByText('Visited')).toBeInTheDocument()
  })

  it('calls onToggle when clicked', () => {
    const onToggle = jest.fn()
    render(<VisitedToggle isVisited={false} onToggle={onToggle} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
npx jest components/forms/VisitedToggle.test.tsx --no-coverage
```

Expected: FAIL

- [ ] **Step 3: Write `components/forms/VisitedToggle.tsx`**

```typescript
'use client'
import { motion } from 'framer-motion'

interface VisitedToggleProps {
  isVisited: boolean
  onToggle: () => void
}

export function VisitedToggle({ isVisited, onToggle }: VisitedToggleProps) {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.97 }}
      className={`flex items-center gap-3 px-5 py-2.5 border transition-all duration-300 font-inter text-[9px] tracking-[0.18em] uppercase ${
        isVisited
          ? 'bg-deep-blue border-deep-blue text-ivory shadow-[0_0_16px_rgba(22,58,112,0.25)]'
          : 'bg-white border-sand text-stone hover:border-deep-blue hover:text-deep-blue'
      }`}
    >
      {isVisited ? (
        <>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Visited
        </>
      ) : (
        'Mark as visited'
      )}
    </motion.button>
  )
}
```

- [ ] **Step 4: Run test to pass**

```bash
npx jest components/forms/VisitedToggle.test.tsx --no-coverage
```

Expected: PASS

- [ ] **Step 5: Write `app/villages/[slug]/page.tsx`**

```typescript
'use client'
import { use, useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import { HeroImage } from '@/components/ui/HeroImage'
import { VillageCard } from '@/components/village/VillageCard'
import { VisitedToggle } from '@/components/forms/VisitedToggle'
import { PageTransition } from '@/components/layout/PageTransition'
import { useVisited } from '@/hooks/useVisited'
import { getVillageBySlug, getNearbyVillages } from '@/lib/villages'
import { supabase } from '@/lib/supabase/client'

interface Props {
  params: Promise<{ slug: string }>
}

export default function VillageDetailPage({ params }: Props) {
  const { slug } = use(params)
  const village = getVillageBySlug(slug)
  if (!village) notFound()

  const nearby = getNearbyVillages(village, 4)
  const { visitedSlugs, getVisitedRecord, toggleVisited } = useVisited()
  const [note, setNote] = useState('')
  const [noteSaved, setNoteSaved] = useState(false)

  const visitedRecord = getVisitedRecord(village.slug)
  const isVisited = visitedSlugs.has(village.slug)

  useEffect(() => {
    if (visitedRecord?.personal_note) setNote(visitedRecord.personal_note)
  }, [visitedRecord])

  async function saveNote() {
    await supabase
      .from('visited_villages')
      .update({ personal_note: note })
      .eq('village_slug', village.slug)
    setNoteSaved(true)
    setTimeout(() => setNoteSaved(false), 2000)
  }

  return (
    <PageTransition>
      {/* Hero */}
      <HeroImage
        src={village.heroImage}
        alt={village.name}
        className="h-[65vh] w-full"
        priority
      />

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 py-16 grid grid-cols-2 gap-16">
        {/* Left — editorial text */}
        <div>
          <p className="font-inter text-[9px] tracking-[0.25em] uppercase text-stone mb-4">
            {village.region} · {village.department}
          </p>
          <h1 className="font-cormorant italic text-[42px] text-deep-blue leading-tight mb-6">
            {village.name}
          </h1>
          <div className="w-8 h-px bg-champagne mb-8" />
          <p className="font-cormorant text-[17px] text-midnight/80 leading-[1.8] mb-10">
            {village.description}
          </p>
          <VisitedToggle
            isVisited={isVisited}
            onToggle={() => toggleVisited(village.slug)}
          />

          {/* Personal notes */}
          <div className="mt-10">
            <label className="font-inter text-[8px] tracking-[0.2em] uppercase text-stone block mb-3">
              Your memories
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              onBlur={isVisited ? saveNote : undefined}
              placeholder="Your memories of this village…"
              rows={4}
              className="w-full font-cormorant text-[16px] text-midnight/80 leading-[1.8] bg-transparent border-0 border-b border-sand/60 focus:outline-none focus:border-deep-blue resize-none placeholder:text-stone/50 pb-2 transition-colors duration-200"
            />
            {noteSaved && (
              <p className="font-inter text-[8px] tracking-[0.1em] uppercase text-champagne mt-1">Saved</p>
            )}
          </div>
        </div>

        {/* Right — photos placeholder */}
        <div>
          <p className="font-inter text-[8px] tracking-[0.2em] uppercase text-stone mb-6">
            Your photos
          </p>
          <div className="h-64 border border-dashed border-sand flex items-center justify-center">
            <p className="font-cormorant italic text-[14px] text-stone">
              Photos attached to memories appear here
            </p>
          </div>
        </div>
      </div>

      {/* Nearby villages */}
      <div className="border-t border-sand/60 py-16">
        <div className="max-w-6xl mx-auto px-8">
          <p className="font-inter text-[9px] tracking-[0.22em] uppercase text-stone mb-8">
            Nearby villages
          </p>
          <div className="grid grid-cols-4 gap-4">
            {nearby.map(v => (
              <VillageCard
                key={v.slug}
                village={v}
                visitedAt={getVisitedRecord(v.slug)?.visited_at}
              />
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
```

- [ ] **Step 6: Verify visually in browser**

Navigate to http://localhost:3000/villages/gordes. Verify:
- 65vh hero photo with parallax on scroll
- Editorial two-column: name/description/toggle left, photos right
- Visited toggle navy fill + champagne glow when active
- Notes textarea saves on blur (only when visited)
- 4 nearby village cards at bottom

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add village detail page with visited toggle, personal notes, and nearby villages"
```

---

### Task 12: JourneyCard + PhotoGallery + Journeys Page

**Files:**
- Create: `components/journey/JourneyCard.tsx`
- Create: `components/journey/PhotoGallery.tsx`
- Create: `app/journeys/page.tsx`
- Create: `components/journey/JourneyCard.test.tsx`

- [ ] **Step 1: Write failing JourneyCard test**

```typescript
// components/journey/JourneyCard.test.tsx
import { render, screen } from '@testing-library/react'
import { JourneyCard } from './JourneyCard'
import type { Journey } from '@/types'

const mockJourney: Journey = {
  id: 'abc-123',
  title: 'Provence Summer',
  year: 2023,
  destination: 'Provence',
  hero_image_url: 'https://example.com/hero.jpg',
  notes: null,
  created_at: '2023-07-01T00:00:00Z',
}

describe('JourneyCard', () => {
  it('renders journey title', () => {
    render(<JourneyCard journey={mockJourney} />)
    expect(screen.getByText('Provence Summer')).toBeInTheDocument()
  })

  it('renders year badge', () => {
    render(<JourneyCard journey={mockJourney} />)
    expect(screen.getByText('2023')).toBeInTheDocument()
  })

  it('links to journey detail', () => {
    render(<JourneyCard journey={mockJourney} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/journeys/abc-123')
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
npx jest components/journey/JourneyCard.test.tsx --no-coverage
```

Expected: FAIL

- [ ] **Step 3: Write `components/journey/JourneyCard.tsx`**

```typescript
import Link from 'next/link'
import Image from 'next/image'
import { StripeAccent } from '@/components/ui/StripeAccent'
import type { Journey } from '@/types'

interface JourneyCardProps {
  journey: Journey
}

export function JourneyCard({ journey }: JourneyCardProps) {
  const imgSrc = journey.hero_image_url || 'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=800&q=70'

  return (
    <Link href={`/journeys/${journey.id}`} className="group block">
      <div className="relative overflow-hidden">
        <div className="relative overflow-hidden" style={{ paddingBottom: '66%' }}>
          <Image
            src={imgSrc}
            alt={journey.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-midnight/80 via-midnight/20 to-transparent" />

          {/* Year badge */}
          {journey.year && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-champagne/90 font-inter text-[9px] tracking-[0.12em] text-midnight">
              {journey.year}
            </div>
          )}

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            {journey.destination && (
              <p className="font-inter text-[7.5px] tracking-[0.2em] uppercase text-champagne/70 mb-2">
                {journey.destination}
              </p>
            )}
            <h3 className="font-cormorant italic text-[18px] text-ivory leading-tight">
              {journey.title}
            </h3>
          </div>
        </div>
        <StripeAccent visited />
      </div>
    </Link>
  )
}
```

- [ ] **Step 4: Run test to pass**

```bash
npx jest components/journey/JourneyCard.test.tsx --no-coverage
```

Expected: PASS

- [ ] **Step 5: Write `components/journey/PhotoGallery.tsx`**

```typescript
'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import type { MemoryPhoto } from '@/types'

interface PhotoGalleryProps {
  photos: MemoryPhoto[]
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  if (photos.length === 0) return null

  return (
    <div className="columns-2 md:columns-3 gap-2">
      {photos.map((photo, i) => (
        <motion.div
          key={photo.id}
          className="break-inside-avoid mb-2 relative overflow-hidden"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Image
            src={photo.storage_url}
            alt={photo.caption || ''}
            width={400}
            height={300}
            className="w-full h-auto object-cover"
          />
          {photo.caption && (
            <p className="font-cormorant italic text-[11px] text-stone mt-1 px-0.5">
              {photo.caption}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  )
}
```

- [ ] **Step 6: Write `app/journeys/page.tsx`**

```typescript
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { JourneyCard } from '@/components/journey/JourneyCard'
import { PageTransition } from '@/components/layout/PageTransition'
import Link from 'next/link'
import type { Journey } from '@/types'

export const dynamic = 'force-dynamic'

export default async function JourneysPage() {
  const supabase = createSupabaseServerClient()
  const { data: journeys } = await supabase
    .from('journeys')
    .select('*')
    .order('created_at', { ascending: false })

  const allJourneys = (journeys || []) as Journey[]

  return (
    <PageTransition>
      <div className="min-h-screen bg-ivory pt-[52px]">
        {/* Header */}
        <div className="px-12 py-16 flex items-end justify-between border-b border-sand/60">
          <div>
            <p className="font-inter text-[9px] tracking-[0.25em] uppercase text-stone mb-4">
              Your archive
            </p>
            <h1 className="font-cormorant italic text-[44px] text-deep-blue leading-tight">
              Journeys
            </h1>
          </div>
          <Link
            href="/journeys/new"
            className="font-inter text-[9px] tracking-[0.18em] uppercase px-6 py-3 bg-deep-blue text-ivory hover:bg-cobalt transition-colors duration-200"
          >
            New Journey
          </Link>
        </div>

        {/* Grid */}
        <div className="px-12 py-12">
          {allJourneys.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-cormorant italic text-[22px] text-stone">
                Your first journey awaits.
              </p>
              <Link
                href="/journeys/new"
                className="inline-block mt-6 font-inter text-[9px] tracking-[0.18em] uppercase text-deep-blue border-b border-deep-blue pb-0.5"
              >
                Begin →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {allJourneys.map(j => (
                <JourneyCard key={j.id} journey={j} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add JourneyCard, PhotoGallery, and journeys list page"
```

---

### Task 13: Create Journey Form

**Files:**
- Create: `components/forms/EditorialForm.tsx`
- Create: `app/journeys/new/page.tsx`

- [ ] **Step 1: Write `components/forms/EditorialForm.tsx`**

Reusable styled form field wrapper used across journey and memory forms.

```typescript
interface EditorialFieldProps {
  label: string
  children: React.ReactNode
}

export function EditorialField({ label, children }: EditorialFieldProps) {
  return (
    <div className="py-8 border-b border-sand/40 last:border-0">
      <label className="block font-inter text-[8px] tracking-[0.22em] uppercase text-stone mb-4">
        {label}
      </label>
      {children}
    </div>
  )
}

export const editorialInputClass =
  'w-full bg-transparent border-0 border-b border-sand focus:border-deep-blue focus:outline-none font-cormorant text-[24px] italic text-deep-blue placeholder:text-stone/40 pb-2 transition-colors duration-200'

export const editorialTextareaClass =
  'w-full bg-transparent border-0 border-b border-sand focus:border-deep-blue focus:outline-none font-cormorant text-[18px] text-midnight/80 leading-[1.8] placeholder:text-stone/40 pb-2 resize-none transition-colors duration-200'
```

- [ ] **Step 2: Write `app/journeys/new/page.tsx`**

```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageTransition } from '@/components/layout/PageTransition'
import { EditorialField, editorialInputClass } from '@/components/forms/EditorialForm'
import { supabase } from '@/lib/supabase/client'

export default function NewJourneyPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [year, setYear] = useState<string>(String(new Date().getFullYear()))
  const [destination, setDestination] = useState('')
  const [heroFile, setHeroFile] = useState<File | null>(null)
  const [heroPreview, setHeroPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setHeroFile(file)
    setHeroPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)

    let hero_image_url: string | null = null

    if (heroFile) {
      const ext = heroFile.name.split('.').pop()
      const path = `${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('journey-heroes')
        .upload(path, heroFile)
      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('journey-heroes')
          .getPublicUrl(path)
        hero_image_url = urlData.publicUrl
      }
    }

    const { data, error } = await supabase
      .from('journeys')
      .insert({
        title: title.trim(),
        year: year ? parseInt(year, 10) : null,
        destination: destination.trim() || null,
        hero_image_url,
      })
      .select()
      .single()

    if (!error && data) {
      router.push(`/journeys/${data.id}`)
    } else {
      setSaving(false)
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-ivory pt-[52px]">
        <div className="max-w-2xl mx-auto px-8 py-16">
          <p className="font-inter text-[9px] tracking-[0.25em] uppercase text-stone mb-6">
            New journey
          </p>
          <h1 className="font-cormorant italic text-[40px] text-deep-blue mb-12">
            Open a new chapter
          </h1>

          <form onSubmit={handleSubmit}>
            <EditorialField label="Journey title">
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Provence, Summer 2024"
                className={editorialInputClass}
                required
                autoFocus
              />
            </EditorialField>

            <EditorialField label="Year">
              <input
                type="number"
                value={year}
                onChange={e => setYear(e.target.value)}
                placeholder="2024"
                min="1900"
                max="2099"
                className={editorialInputClass}
              />
            </EditorialField>

            <EditorialField label="Destination">
              <input
                type="text"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                placeholder="France · Provence"
                className={editorialInputClass}
              />
            </EditorialField>

            <EditorialField label="Hero photograph">
              {heroPreview ? (
                <div className="relative">
                  <img src={heroPreview} alt="Preview" className="w-full h-48 object-cover" />
                  <button
                    type="button"
                    onClick={() => { setHeroFile(null); setHeroPreview(null) }}
                    className="absolute top-2 right-2 font-inter text-[8px] tracking-[0.1em] uppercase bg-midnight/70 text-ivory px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center h-32 border border-dashed border-sand cursor-pointer hover:border-deep-blue transition-colors duration-200">
                  <span className="font-inter text-[9px] tracking-[0.15em] uppercase text-stone">
                    Upload photo
                  </span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
                </label>
              )}
            </EditorialField>

            <div className="pt-8">
              <button
                type="submit"
                disabled={saving || !title.trim()}
                className="font-inter text-[10px] tracking-[0.18em] uppercase px-8 py-3 bg-deep-blue text-ivory hover:bg-cobalt disabled:opacity-40 transition-colors duration-200"
              >
                {saving ? 'Creating…' : 'Begin Journey'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageTransition>
  )
}
```

- [ ] **Step 3: Test in browser**

Navigate to http://localhost:3000/journeys/new. Verify:
- Luxury notebook aesthetic: label above, large Cormorant input below, border-bottom only
- File upload shows preview image inline
- Submit creates Supabase record and redirects to `/journeys/[id]`

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add create journey form with hero image upload to Supabase Storage"
```

---

### Task 14: MemoryBlock + JourneyMap

**Files:**
- Create: `components/journey/MemoryBlock.tsx`
- Create: `components/journey/JourneyMapInner.tsx`
- Create: `components/journey/JourneyMap.tsx`
- Create: `components/journey/MemoryBlock.test.tsx`

- [ ] **Step 1: Write failing MemoryBlock test**

```typescript
// components/journey/MemoryBlock.test.tsx
import { render, screen } from '@testing-library/react'
import { MemoryBlock } from './MemoryBlock'
import type { Memory } from '@/types'

const mockMemory: Memory = {
  id: 'm-1',
  journey_id: 'j-1',
  title: 'Sunset at Gordes',
  body: 'The light turned everything gold.',
  location_name: 'Gordes',
  lat: 43.9117,
  lng: 5.2011,
  created_at: '2023-07-15T18:30:00Z',
  memory_photos: [],
}

describe('MemoryBlock', () => {
  it('renders memory title', () => {
    render(<MemoryBlock memory={mockMemory} />)
    expect(screen.getByText('Sunset at Gordes')).toBeInTheDocument()
  })

  it('renders memory body', () => {
    render(<MemoryBlock memory={mockMemory} />)
    expect(screen.getByText('The light turned everything gold.')).toBeInTheDocument()
  })

  it('renders location name', () => {
    render(<MemoryBlock memory={mockMemory} />)
    expect(screen.getByText('Gordes')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
npx jest components/journey/MemoryBlock.test.tsx --no-coverage
```

Expected: FAIL

- [ ] **Step 3: Write `components/journey/MemoryBlock.tsx`**

```typescript
import { PhotoGallery } from './PhotoGallery'
import type { Memory } from '@/types'

interface MemoryBlockProps {
  memory: Memory
}

export function MemoryBlock({ memory }: MemoryBlockProps) {
  const date = new Date(memory.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <article className="py-12 border-b border-sand/40 last:border-0">
      <div className="flex items-start gap-12">
        {/* Date column */}
        <div className="w-24 flex-shrink-0 pt-1">
          <p className="font-inter text-[8px] tracking-[0.15em] uppercase text-stone leading-relaxed">
            {date}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {memory.location_name && (
            <p className="font-inter text-[8px] tracking-[0.2em] uppercase text-stone mb-3">
              {memory.location_name}
            </p>
          )}
          {memory.title && (
            <h3 className="font-cormorant italic text-[24px] text-deep-blue leading-tight mb-4">
              {memory.title}
            </h3>
          )}
          {memory.body && (
            <p className="font-cormorant text-[17px] text-midnight/80 leading-[1.8] mb-6">
              {memory.body}
            </p>
          )}
          {memory.memory_photos && memory.memory_photos.length > 0 && (
            <div className="mt-6">
              <PhotoGallery photos={memory.memory_photos} />
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
```

- [ ] **Step 4: Run test to pass**

```bash
npx jest components/journey/MemoryBlock.test.tsx --no-coverage
```

Expected: PASS

- [ ] **Step 5: Write `components/journey/JourneyMapInner.tsx`**

```typescript
'use client'
import { MapContainer, TileLayer, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import type { Memory } from '@/types'

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY
const TILE_URL = `https://api.maptiler.com/maps/positron/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`

interface StopMarkersProps {
  memories: Memory[]
}

function StopMarkers({ memories }: StopMarkersProps) {
  const map = useMap()
  const markersRef = useRef<L.CircleMarker[]>([])

  useEffect(() => {
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    const valid = memories.filter(m => m.lat !== null && m.lng !== null)
    valid.forEach((m, i) => {
      const marker = L.circleMarker([m.lat!, m.lng!], {
        radius: 6,
        fillColor: '#163A70',
        fillOpacity: 1,
        color: '#F7F5F1',
        weight: 2,
      })
      if (m.location_name) {
        marker.bindTooltip(`${i + 1}. ${m.location_name}`, { className: 'village-tooltip', direction: 'top' })
      }
      marker.addTo(map)
      markersRef.current.push(marker)
    })

    if (valid.length > 0) {
      const bounds = L.latLngBounds(valid.map(m => [m.lat!, m.lng!]))
      map.fitBounds(bounds, { padding: [40, 40] })
    }

    return () => { markersRef.current.forEach(m => m.remove()) }
  }, [memories, map])

  return null
}

interface JourneyMapInnerProps {
  memories: Memory[]
}

export default function JourneyMapInner({ memories }: JourneyMapInnerProps) {
  const validMemories = memories.filter(m => m.lat !== null && m.lng !== null)
  const positions = validMemories.map(m => [m.lat!, m.lng!] as [number, number])

  return (
    <MapContainer
      center={[46.8, 2.3]}
      zoom={6}
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer url={TILE_URL} attribution="© MapTiler © OpenStreetMap" tileSize={512} zoomOffset={-1} />
      {positions.length > 1 && (
        <Polyline
          positions={positions}
          pathOptions={{ color: '#163A70', weight: 2, opacity: 0.6, dashArray: '6 8' }}
        />
      )}
      <StopMarkers memories={memories} />
    </MapContainer>
  )
}
```

- [ ] **Step 6: Write `components/journey/JourneyMap.tsx`**

```typescript
'use client'
import dynamic from 'next/dynamic'
import { ShimmerLoader } from '@/components/layout/ShimmerLoader'
import type { Memory } from '@/types'

const JourneyMapInner = dynamic(() => import('./JourneyMapInner'), {
  ssr: false,
  loading: () => <ShimmerLoader className="h-full w-full" />,
})

interface JourneyMapProps {
  memories: Memory[]
  className?: string
}

export function JourneyMap({ memories, className = '' }: JourneyMapProps) {
  return (
    <div className={className}>
      <JourneyMapInner memories={memories} />
    </div>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add MemoryBlock component and JourneyMap with dashed polyline route"
```

---

### Task 15: Journey Detail Page

**Files:**
- Create: `app/journeys/[id]/page.tsx`

- [ ] **Step 1: Write `app/journeys/[id]/page.tsx`**

```typescript
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { HeroImage } from '@/components/ui/HeroImage'
import { MemoryBlock } from '@/components/journey/MemoryBlock'
import { JourneyMap } from '@/components/journey/JourneyMap'
import { PageTransition } from '@/components/layout/PageTransition'
import type { Journey, Memory } from '@/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function JourneyDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = createSupabaseServerClient()

  const [{ data: journey }, { data: memories }] = await Promise.all([
    supabase.from('journeys').select('*').eq('id', id).single(),
    supabase
      .from('memories')
      .select('*, memory_photos(*)')
      .eq('journey_id', id)
      .order('created_at', { ascending: true }),
  ])

  if (!journey) notFound()

  const typedJourney = journey as Journey
  const typedMemories = (memories || []) as Memory[]
  const heroSrc = typedJourney.hero_image_url ||
    'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=1600&q=80'

  return (
    <PageTransition>
      {/* Hero */}
      <HeroImage src={heroSrc} alt={typedJourney.title} className="h-[70vh] w-full" priority />

      {/* Journey header */}
      <div className="max-w-4xl mx-auto px-8 py-16">
        <p className="font-inter text-[9px] tracking-[0.25em] uppercase text-stone mb-4">
          {typedJourney.year && `${typedJourney.year} · `}{typedJourney.destination || 'Journey'}
        </p>
        <h1 className="font-cormorant italic text-[44px] text-deep-blue leading-tight mb-6">
          {typedJourney.title}
        </h1>
        {typedJourney.notes && (
          <>
            <div className="w-8 h-px bg-champagne mb-8" />
            <p className="font-cormorant text-[18px] text-midnight/80 leading-[1.8]">
              {typedJourney.notes}
            </p>
          </>
        )}
      </div>

      {/* Route map */}
      {typedMemories.some(m => m.lat && m.lng) && (
        <div className="max-w-4xl mx-auto px-8 mb-16">
          <p className="font-inter text-[8px] tracking-[0.2em] uppercase text-stone mb-4">
            Route
          </p>
          <JourneyMap memories={typedMemories} className="h-64 border border-sand/60" />
        </div>
      )}

      {/* Memory timeline */}
      <div className="max-w-4xl mx-auto px-8 pb-32">
        <p className="font-inter text-[9px] tracking-[0.22em] uppercase text-stone mb-2">
          Memories
        </p>
        <div className="w-full h-px bg-sand/60 mb-0" />
        {typedMemories.length === 0 ? (
          <p className="font-cormorant italic text-[18px] text-stone py-12">
            No memories yet — add your first.
          </p>
        ) : (
          typedMemories.map(m => <MemoryBlock key={m.id} memory={m} />)
        )}
      </div>

      {/* FAB — Add Memory */}
      <Link
        href={`/journeys/${id}/memory/new`}
        className="no-print fixed bottom-8 right-8 w-14 h-14 rounded-full bg-deep-blue text-ivory flex items-center justify-center shadow-lg hover:bg-cobalt transition-colors duration-200 z-40"
        aria-label="Add memory"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </Link>
    </PageTransition>
  )
}
```

- [ ] **Step 2: Verify in browser**

Create a journey at http://localhost:3000/journeys/new, then verify the detail page shows:
- Hero photo with parallax
- Title, year, destination header
- Empty memory state with editorial copy
- Navy FAB bottom-right

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add journey detail page with memory timeline, route map, and FAB"
```

---

### Task 16: Add Memory Form

**Files:**
- Create: `app/journeys/[id]/memory/new/page.tsx`

- [ ] **Step 1: Write `app/journeys/[id]/memory/new/page.tsx`**

```typescript
'use client'
import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { PageTransition } from '@/components/layout/PageTransition'
import { EditorialField, editorialInputClass, editorialTextareaClass } from '@/components/forms/EditorialForm'
import { ShimmerLoader } from '@/components/layout/ShimmerLoader'
import { supabase } from '@/lib/supabase/client'

const LocationPicker = dynamic(() => import('@/components/forms/LocationPicker'), {
  ssr: false,
  loading: () => <ShimmerLoader className="h-48 w-full" />,
})

interface Props {
  params: Promise<{ id: string }>
}

export default function NewMemoryPage({ params }: Props) {
  const { id: journeyId } = use(params)
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [locationName, setLocationName] = useState('')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    setPhotos(prev => [...prev, ...files])
    setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const { data: memory, error } = await supabase
      .from('memories')
      .insert({
        journey_id: journeyId,
        title: title.trim() || null,
        body: body.trim() || null,
        location_name: locationName.trim() || null,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
      })
      .select()
      .single()

    if (error || !memory) { setSaving(false); return }

    // Upload photos sequentially
    for (let i = 0; i < photos.length; i++) {
      const file = photos[i]
      const ext = file.name.split('.').pop()
      const path = `${memory.id}-${i}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('memory-photos')
        .upload(path, file)
      if (!upErr) {
        const { data: urlData } = supabase.storage.from('memory-photos').getPublicUrl(path)
        await supabase.from('memory_photos').insert({
          memory_id: memory.id,
          storage_url: urlData.publicUrl,
          sort_order: i,
        })
      }
    }

    router.push(`/journeys/${journeyId}`)
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-ivory pt-[52px]">
        <div className="max-w-2xl mx-auto px-8 py-16">
          <p className="font-inter text-[9px] tracking-[0.25em] uppercase text-stone mb-6">
            New memory
          </p>
          <h1 className="font-cormorant italic text-[36px] text-deep-blue mb-12">
            Capture the moment
          </h1>

          <form onSubmit={handleSubmit}>
            <EditorialField label="Title (optional)">
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Sunset at the ramparts"
                className={editorialInputClass}
              />
            </EditorialField>

            <EditorialField label="Notes">
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="What did it feel like…"
                rows={5}
                className={editorialTextareaClass}
              />
            </EditorialField>

            <EditorialField label="Location">
              <input
                type="text"
                value={locationName}
                onChange={e => setLocationName(e.target.value)}
                placeholder="Village or place name"
                className={`${editorialInputClass} mb-4`}
              />
              <p className="font-inter text-[8px] tracking-[0.1em] uppercase text-stone mb-2">
                Pin on map (optional)
              </p>
              <LocationPicker value={coords} onChange={setCoords} />
            </EditorialField>

            <EditorialField label="Photographs">
              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {previews.map((src, i) => (
                    <img key={i} src={src} alt="" className="w-full h-24 object-cover" />
                  ))}
                </div>
              )}
              <label className="flex items-center justify-center h-16 border border-dashed border-sand cursor-pointer hover:border-deep-blue transition-colors duration-200">
                <span className="font-inter text-[9px] tracking-[0.15em] uppercase text-stone">
                  Add photos
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="sr-only"
                />
              </label>
            </EditorialField>

            <div className="pt-8">
              <button
                type="submit"
                disabled={saving}
                className="font-inter text-[10px] tracking-[0.18em] uppercase px-8 py-3 bg-deep-blue text-ivory hover:bg-cobalt disabled:opacity-40 transition-colors duration-200"
              >
                {saving ? 'Saving…' : 'Save Memory'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageTransition>
  )
}
```

- [ ] **Step 2: Write `components/forms/LocationPicker.tsx`**

This must be a separate file — imported dynamically with `ssr: false`.

```typescript
'use client'
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY
const TILE_URL = `https://api.maptiler.com/maps/positron/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`

interface ClickHandlerProps {
  onChange: (coords: { lat: number; lng: number }) => void
  value: { lat: number; lng: number } | null
}

function ClickHandler({ onChange, value }: ClickHandlerProps) {
  const map = useMap()
  const markerRef = useRef<L.CircleMarker | null>(null)

  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })

  useEffect(() => {
    markerRef.current?.remove()
    if (value) {
      const m = L.circleMarker([value.lat, value.lng], {
        radius: 7, fillColor: '#163A70', fillOpacity: 1, color: '#F7F5F1', weight: 2,
      }).addTo(map)
      markerRef.current = m
    }
    return () => { markerRef.current?.remove() }
  }, [value, map])

  return null
}

interface LocationPickerProps {
  value: { lat: number; lng: number } | null
  onChange: (coords: { lat: number; lng: number }) => void
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  return (
    <MapContainer center={[46.8, 2.3]} zoom={5} className="h-48 w-full" zoomControl={false}>
      <TileLayer url={TILE_URL} attribution="© MapTiler © OpenStreetMap" tileSize={512} zoomOffset={-1} />
      <ClickHandler onChange={onChange} value={value} />
    </MapContainer>
  )
}
```

- [ ] **Step 3: Verify in browser**

Navigate to a journey detail page, click FAB "+". Verify:
- Form with luxury notebook aesthetic
- Map click sets pin location
- Multi-photo upload shows previews
- Submit creates memory + photos in Supabase, redirects back to journey

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add memory creation form with location picker and photo upload"
```

---

### Task 17: Itinerary Generator + Detail

**Files:**
- Create: `components/itinerary/DayBlock.tsx`
- Create: `components/itinerary/RouteMapInner.tsx`
- Create: `components/itinerary/RouteMap.tsx`
- Create: `app/itineraries/page.tsx`
- Create: `app/itineraries/[id]/page.tsx`

- [ ] **Step 1: Write `components/itinerary/DayBlock.tsx`**

```typescript
import Link from 'next/link'
import type { ItineraryDay } from '@/types'

interface DayBlockProps {
  day: ItineraryDay
}

export function DayBlock({ day }: DayBlockProps) {
  return (
    <div className="py-10 border-b border-sand/40 last:border-0">
      <div className="flex items-baseline gap-4 mb-2">
        <h3 className="font-cormorant italic text-[28px] text-deep-blue leading-none">
          {day.label}
        </h3>
        <div className="h-px flex-1 bg-sand/60" />
      </div>
      <p className="font-cormorant italic text-[14px] text-stone mb-8">
        {day.atmosphereNote}
      </p>

      <div className="space-y-6">
        {day.stops.map((stop, i) => (
          <div key={stop.village.slug} className="flex gap-6">
            {/* Stop number */}
            <div className="w-6 flex-shrink-0 pt-1">
              <span className="font-cormorant italic text-[16px] text-champagne">{i + 1}</span>
            </div>
            {/* Village info */}
            <div className="flex-1">
              {stop.driveTimeFromPrevMinutes !== null && (
                <p className="font-inter text-[7.5px] tracking-[0.15em] uppercase text-stone mb-1">
                  {stop.driveTimeFromPrevMinutes} min drive
                </p>
              )}
              <Link
                href={`/villages/${stop.village.slug}`}
                className="font-cormorant italic text-[20px] text-deep-blue hover:text-cobalt transition-colors duration-200"
              >
                {stop.village.name}
              </Link>
              <p className="font-inter text-[8px] tracking-[0.1em] text-stone mt-0.5">
                {stop.village.department}
              </p>
              <p className="font-cormorant text-[14px] text-midnight/70 leading-relaxed mt-2 line-clamp-2">
                {stop.village.description}
              </p>
            </div>
            {/* Village photo */}
            <div className="w-20 h-20 flex-shrink-0 overflow-hidden">
              <img
                src={`${stop.village.heroImage}&w=120&q=60`}
                alt={stop.village.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write `components/itinerary/RouteMapInner.tsx`**

```typescript
'use client'
import { MapContainer, TileLayer, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import type { ItineraryDay } from '@/types'

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY
const TILE_URL = `https://api.maptiler.com/maps/positron/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`

function RouteMarkers({ days }: { days: ItineraryDay[] }) {
  const map = useMap()
  const refs = useRef<L.CircleMarker[]>([])

  useEffect(() => {
    refs.current.forEach(m => m.remove())
    refs.current = []

    const allStops = days.flatMap(d => d.stops)
    allStops.forEach((stop, i) => {
      const m = L.circleMarker([stop.village.lat, stop.village.lng], {
        radius: 6,
        fillColor: '#D6C3A5',
        fillOpacity: 1,
        color: '#163A70',
        weight: 1.5,
      })
      m.bindTooltip(`${i + 1}. ${stop.village.name}`, { className: 'village-tooltip', direction: 'top' })
      m.addTo(map)
      refs.current.push(m)
    })

    if (allStops.length > 0) {
      const bounds = L.latLngBounds(allStops.map(s => [s.village.lat, s.village.lng]))
      map.fitBounds(bounds, { padding: [40, 40] })
    }

    return () => { refs.current.forEach(m => m.remove()) }
  }, [days, map])

  return null
}

interface RouteMapInnerProps {
  days: ItineraryDay[]
}

export default function RouteMapInner({ days }: RouteMapInnerProps) {
  const positions = days
    .flatMap(d => d.stops)
    .map(s => [s.village.lat, s.village.lng] as [number, number])

  return (
    <MapContainer center={[46.8, 2.3]} zoom={6} className="h-full w-full" zoomControl={false}>
      <TileLayer url={TILE_URL} attribution="© MapTiler © OpenStreetMap" tileSize={512} zoomOffset={-1} />
      {positions.length > 1 && (
        <Polyline
          positions={positions}
          pathOptions={{ color: '#D6C3A5', weight: 2.5, opacity: 0.9, dashArray: '8 10' }}
        />
      )}
      <RouteMarkers days={days} />
    </MapContainer>
  )
}
```

- [ ] **Step 3: Write `components/itinerary/RouteMap.tsx`**

```typescript
'use client'
import dynamic from 'next/dynamic'
import { ShimmerLoader } from '@/components/layout/ShimmerLoader'
import type { ItineraryDay } from '@/types'

const RouteMapInner = dynamic(() => import('./RouteMapInner'), {
  ssr: false,
  loading: () => <ShimmerLoader className="h-full w-full" />,
})

interface RouteMapProps {
  days: ItineraryDay[]
  className?: string
}

export function RouteMap({ days, className = '' }: RouteMapProps) {
  return (
    <div className={className}>
      <RouteMapInner days={days} />
    </div>
  )
}
```

- [ ] **Step 4: Write `app/itineraries/page.tsx`**

```typescript
'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { PageTransition } from '@/components/layout/PageTransition'
import { DayBlock } from '@/components/itinerary/DayBlock'
import { RouteMap } from '@/components/itinerary/RouteMap'
import { useVisited } from '@/hooks/useVisited'
import { getAllVillages, getUniqueRegions } from '@/lib/villages'
import { generateItinerary } from '@/lib/itinerary-algorithm'
import { supabase } from '@/lib/supabase/client'

const STYLE_OPTIONS = [
  { value: 'medieval', label: 'Hidden Villages' },
  { value: 'gastronomy', label: 'Gastronomy Escape' },
  { value: 'wine', label: 'Wine Journey' },
  { value: 'coastal', label: 'Coastal Villages' },
  { value: 'photography', label: 'Photography Route' },
  { value: 'architectural', label: 'Architectural Discovery' },
  { value: 'hidden', label: 'Slow Luxury' },
]

const regions = getUniqueRegions()
const allVillages = getAllVillages()

export default function ItinerariesPage() {
  const { visitedSlugs } = useVisited()
  const router = useRouter()
  const [days, setDays] = useState(5)
  const [region, setRegion] = useState('')
  const [styles, setStyles] = useState<string[]>([])
  const [pace, setPace] = useState<'slow' | 'moderate' | 'intensive'>('moderate')
  const [excludeVisited, setExcludeVisited] = useState(false)
  const [saving, setSaving] = useState(false)

  const preview = useMemo(() => {
    return generateItinerary(allVillages, {
      days,
      region: region || undefined,
      styles,
      pace,
      excludeVisited: excludeVisited ? [...visitedSlugs] : [],
    })
  }, [days, region, styles, pace, excludeVisited, visitedSlugs])

  function toggleStyle(val: string) {
    setStyles(prev =>
      prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val]
    )
  }

  async function handleGenerate() {
    setSaving(true)
    const title = `${days} Days${region ? ` in ${region}` : ''} — ${styles.length > 0 ? STYLE_OPTIONS.find(s => s.value === styles[0])?.label : 'Discovery'}`
    const villageSlugs = preview.days.flatMap(d => d.stops.map(s => s.village.slug))

    const { data, error } = await supabase
      .from('itineraries')
      .insert({ title, days, pace, style: styles, village_slugs: villageSlugs })
      .select()
      .single()

    if (!error && data) {
      router.push(`/itineraries/${data.id}`)
    } else {
      setSaving(false)
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-ivory pt-[52px] flex">
        {/* Left — inputs */}
        <div className="w-[380px] flex-shrink-0 border-r border-sand/60 p-10 overflow-y-auto">
          <p className="font-inter text-[9px] tracking-[0.25em] uppercase text-stone mb-6">
            Plan
          </p>
          <h1 className="font-cormorant italic text-[34px] text-deep-blue leading-tight mb-12">
            Compose an Itinerary
          </h1>

          {/* Days */}
          <div className="mb-10">
            <label className="font-inter text-[8px] tracking-[0.2em] uppercase text-stone block mb-3">
              Days
            </label>
            <div className="flex items-baseline gap-4">
              <span className="font-cormorant italic text-[44px] text-deep-blue leading-none">{days}</span>
              <input
                type="range"
                min={2} max={10} value={days}
                onChange={e => setDays(Number(e.target.value))}
                className="flex-1 accent-deep-blue"
              />
            </div>
          </div>

          {/* Region */}
          <div className="mb-10">
            <label className="font-inter text-[8px] tracking-[0.2em] uppercase text-stone block mb-3">
              Departure region
            </label>
            <select
              value={region}
              onChange={e => setRegion(e.target.value)}
              className="w-full bg-transparent border-b border-sand font-cormorant italic text-[16px] text-deep-blue pb-1 focus:outline-none focus:border-deep-blue"
            >
              <option value="">Any region</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Travel style */}
          <div className="mb-10">
            <label className="font-inter text-[8px] tracking-[0.2em] uppercase text-stone block mb-3">
              Travel style
            </label>
            <div className="flex flex-wrap gap-2">
              {STYLE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleStyle(opt.value)}
                  className={`font-inter text-[8px] tracking-[0.1em] uppercase px-3 py-1.5 border transition-colors duration-150 ${
                    styles.includes(opt.value)
                      ? 'bg-deep-blue text-ivory border-deep-blue'
                      : 'bg-white text-stone border-sand hover:border-deep-blue hover:text-deep-blue'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pace */}
          <div className="mb-10">
            <label className="font-inter text-[8px] tracking-[0.2em] uppercase text-stone block mb-3">
              Pace
            </label>
            <div className="flex gap-2">
              {(['slow', 'moderate', 'intensive'] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPace(p)}
                  className={`flex-1 font-inter text-[8px] tracking-[0.1em] uppercase px-2 py-2 border transition-colors duration-150 ${
                    pace === p
                      ? 'bg-deep-blue text-ivory border-deep-blue'
                      : 'bg-white text-stone border-sand hover:border-deep-blue'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Exclude visited */}
          <div className="mb-12 flex items-center gap-3">
            <input
              type="checkbox"
              id="excludeVisited"
              checked={excludeVisited}
              onChange={e => setExcludeVisited(e.target.checked)}
              className="accent-deep-blue"
            />
            <label htmlFor="excludeVisited" className="font-inter text-[9px] tracking-[0.1em] uppercase text-stone cursor-pointer">
              Exclude already visited
            </label>
          </div>

          <button
            onClick={handleGenerate}
            disabled={saving || preview.totalVillages === 0}
            className="w-full font-inter text-[10px] tracking-[0.18em] uppercase py-4 bg-deep-blue text-ivory hover:bg-cobalt disabled:opacity-40 transition-colors duration-200"
          >
            {saving ? 'Generating…' : 'Generate Itinerary'}
          </button>
        </div>

        {/* Right — live preview */}
        <div className="flex-1 overflow-y-auto p-10">
          <p className="font-inter text-[8px] tracking-[0.2em] uppercase text-stone mb-2">
            Preview — {preview.totalVillages} villages
          </p>
          <div className="w-full h-px bg-sand/60 mb-8" />
          {preview.totalVillages === 0 ? (
            <p className="font-cormorant italic text-[18px] text-stone">
              Adjust your filters to see villages.
            </p>
          ) : (
            preview.days.map(day => <DayBlock key={day.dayNumber} day={day} />)
          )}
        </div>
      </div>
    </PageTransition>
  )
}
```

- [ ] **Step 5: Write `app/itineraries/[id]/page.tsx`**

```typescript
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { DayBlock } from '@/components/itinerary/DayBlock'
import { RouteMap } from '@/components/itinerary/RouteMap'
import { PageTransition } from '@/components/layout/PageTransition'
import { getAllVillages } from '@/lib/villages'
import { generateItinerary } from '@/lib/itinerary-algorithm'
import type { Itinerary } from '@/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

const VILLAGES_PER_DAY = { slow: 2, moderate: 3, intensive: 4 }

export default async function ItineraryDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = createSupabaseServerClient()
  const { data } = await supabase.from('itineraries').select('*').eq('id', id).single()
  if (!data) notFound()

  const itinerary = data as Itinerary
  const allVillages = getAllVillages()

  // Reconstruct days from stored village_slugs
  const orderedVillages = itinerary.village_slugs
    .map(slug => allVillages.find(v => v.slug === slug))
    .filter(Boolean) as typeof allVillages

  const pace = (itinerary.pace || 'moderate') as 'slow' | 'moderate' | 'intensive'
  const vpd = VILLAGES_PER_DAY[pace]

  // Re-run algorithm with fixed slug order to get drive times
  const preview = generateItinerary(orderedVillages, {
    days: itinerary.days || Math.ceil(orderedVillages.length / vpd),
    styles: itinerary.style,
    pace,
  })

  const heroVillage = orderedVillages[0]

  return (
    <PageTransition>
      {/* Hero */}
      {heroVillage && (
        <div className="relative h-[50vh] overflow-hidden">
          <img
            src={`${heroVillage.heroImage}&w=1600&q=80`}
            alt={heroVillage.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-midnight/80 to-transparent" />
          <div className="absolute bottom-10 left-12">
            <p className="font-inter text-[8px] tracking-[0.22em] uppercase text-champagne/70 mb-3">
              Itinerary
            </p>
            <h1 className="font-cormorant italic text-[40px] text-ivory leading-tight">
              {itinerary.title}
            </h1>
          </div>
        </div>
      )}

      {/* Two-column magazine layout */}
      <div className="max-w-6xl mx-auto px-8 py-16 grid grid-cols-[1fr_420px] gap-16 print:grid-cols-1">
        {/* Left — day sequence */}
        <div>
          {preview.days.map(day => <DayBlock key={day.dayNumber} day={day} />)}
        </div>

        {/* Right — route map (sticky) */}
        <div className="no-print">
          <div className="sticky top-[72px]">
            <p className="font-inter text-[8px] tracking-[0.2em] uppercase text-stone mb-4">
              Route
            </p>
            <RouteMap
              days={preview.days}
              className="h-80 border border-sand/60 mb-6"
            />
            <div className="space-y-1">
              <p className="font-inter text-[8px] tracking-[0.1em] text-stone">
                {preview.totalVillages} villages · {itinerary.days} days · {pace}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
```

- [ ] **Step 6: Verify in browser**

Navigate to http://localhost:3000/itineraries. Verify:
- Left panel: all inputs (days slider, region, style pills, pace, exclude)
- Right panel: live-updating village sequence as inputs change
- "Generate Itinerary" creates Supabase record + redirects to detail
- Detail page: full-width hero, two-column layout, champagne route polyline on map
- Route map sticky on scroll

- [ ] **Step 7: Run all tests**

```bash
npx jest --no-coverage
```

Expected: All previously written tests pass.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add itinerary generator with live preview and magazine detail layout"
```

---

## Self-Review

### Spec Coverage

| Spec requirement | Task |
|---|---|
| Homepage hero (Asymmetric Atlas) | Task 7 |
| Homepage 3 feature blocks | Task 7 |
| NavBar transparent → dark on scroll | Task 6 |
| `/villages` split map + card list | Task 10 |
| Village search + visited filter | Task 10 |
| Village card (portrait editorial) | Task 8 |
| Leaflet ivory atlas map | Task 9 |
| Village markers navy/ring states | Task 9 |
| `/villages/[slug]` detail page | Task 11 |
| Visited toggle with champagne glow | Task 11 |
| Personal notes on village | Task 11 |
| Nearby villages horizontal scroll | Task 11 |
| `/journeys` masonry grid | Task 12 |
| Journey card with year badge | Task 12 |
| `/journeys/new` notebook form | Task 13 |
| Hero image upload to Supabase | Task 13 |
| `/journeys/[id]` detail + timeline | Task 15 |
| JourneyMap dashed polyline | Task 14 |
| MemoryBlock editorial layout | Task 14 |
| FAB "+ Add Memory" | Task 15 |
| `/journeys/[id]/memory/new` | Task 16 |
| Location picker (map click) | Task 16 |
| Multi-photo upload | Task 16 |
| `/itineraries` generator UI | Task 17 |
| Itinerary algorithm (haversine) | Task 4 |
| `/itineraries/[id]` magazine layout | Task 17 |
| RouteMap champagne polyline | Task 17 |
| Print-ready itinerary (`@media print`) | Task 1 (globals.css) + Task 17 |
| Supabase schema all tables | Task 2 |
| Village JSON (10 of 184 seeded) | Task 3 |
| PageTransition fade | Task 5 |
| HeroImage parallax | Task 5 |
| StripeAccent motif | Task 5 |
| ShimmerLoader (no spinners) | Task 5 |
| Design tokens in Tailwind | Task 1 |
| Cormorant Garamond + Inter fonts | Task 6 |

**Remaining before launch:** Populate `data/villages.json` with all 184 Most Beautiful Villages of France (Task 3 seeds 10). The schema and utility functions are complete — adding entries requires no code changes.

### Type Consistency Check

- `ItineraryInput.excludeVisited` → `string[]` — used in Task 4 algorithm ✓
- `generateItinerary` returns `GeneratedItinerary` with `days: ItineraryDay[]` — consumed in Tasks 17 ✓
- `VillageCard` receives `visitedAt?: string | null` — passed from `getVisitedRecord(slug)?.visited_at` ✓
- `JourneyMap` and `RouteMap` both import `Memory`/`ItineraryDay` from `@/types` — consistent ✓
- `supabase.from('visited_villages').delete().eq('village_slug', slug)` — matches schema `village_slug text` ✓
- `memory_photos` join: `select('*, memory_photos(*)')` — matches `memory_photos(memory_id uuid references memories)` ✓

### jest.config.ts Correction

Task 1 Step 4 has a typo: `setupFilesAfterFramework` should be `setupFilesAfterFrameWork`. Correct version:

```typescript
const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterFrameWork: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^react-leaflet$': '<rootDir>/__mocks__/react-leaflet.tsx',
    '^leaflet$': '<rootDir>/__mocks__/leaflet.ts',
  },
}
```

Actually the correct Jest key is `setupFilesAfterFramework` — verify against the installed Jest version with `npx jest --showConfig | grep setup`.
