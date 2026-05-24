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

export type TravelPace = 'slow' | 'moderate' | 'intensive'

export interface Itinerary {
  id: string
  title: string | null
  days: number | null
  pace: TravelPace | null
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
  pace: TravelPace
  excludeVisited?: string[]
}
