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
  const seen = new Set<string>()
  villages.forEach(v => seen.add(v.region))
  return Array.from(seen).sort()
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
