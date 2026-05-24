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
    .map(v => ({ v, d: haversineKm(source.lat, source.lng, v.lat, v.lng) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, count)
    .map(({ v }) => v)
}
