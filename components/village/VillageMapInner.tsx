'use client'
import { MapContainer, TileLayer } from 'react-leaflet'
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
