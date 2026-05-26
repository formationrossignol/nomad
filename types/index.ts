export type PepiteFilterCategory =
  | 'Promenades'
  | 'Grottes'
  | 'Parcs & jardins'
  | 'Villages'
  | 'Châteaux'
  | 'Monuments & musées'
  | 'Littoral & îles'
  | 'Plus beaux villages'

export interface Pepite {
  id: string
  name: string
  slug: string
  filterCategory: PepiteFilterCategory
  region: string
  department: string
  lat: number
  lng: number
  shortDescription: string
  imageUrl: string
}

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
  visitDurationMinutes: number
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

export interface VisitedPepite {
  id: string
  pepite_slug: string
  visited_at: string | null
}

export interface SavedVehicle {
  id: string
  user_id: string
  marque: string
  libelle_modele: string
  description_commerciale: string | null
  energie: string
  conso_mixte: number | null
  created_at: string
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
  visitDurationMinutes: number
}

export interface ItineraryDay {
  dayNumber: number
  label: string
  atmosphereNote: string
  stops: ItineraryStop[]
  totalTimeMinutes: number
}

export interface DepartureCity {
  name: string
  lat: number
  lng: number
}

export interface GeneratedItinerary {
  days: ItineraryDay[]
  totalVillages: number
  totalDistanceKm: number
  poolExhausted: boolean
  departureCity: DepartureCity | null
  returnTimeMinutes: number | null
}

export interface ItineraryInput {
  days: number
  regions?: string[]
  styles: string[]
  pace: TravelPace
  excludeVisited?: string[]
  departureLat?: number
  departureLng?: number
  departureName?: string
}
