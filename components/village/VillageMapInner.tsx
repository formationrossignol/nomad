// components/village/VillageMapInner.tsx
'use client'
import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import 'react-leaflet-cluster/lib/assets/MarkerCluster.css'
import 'react-leaflet-cluster/lib/assets/MarkerCluster.Default.css'
import type { Village } from '@/types'

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY
const TILE_URL = `https://api.maptiler.com/maps/positron/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`
const FRANCE_CENTER: [number, number] = [46.8, 2.3]

function createVillageIcon(isVisited: boolean, isActive: boolean) {
  const size = isActive ? 20 : 14
  const bg = isVisited ? '#163A70' : 'transparent'
  const border = isVisited ? 'none' : '1.5px solid #163A70'
  const dotSize = isActive ? 5 : 4
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      border-radius:50%;
      background:${bg};
      border:${border};
      display:flex;align-items:center;justify-content:center;
      cursor:pointer;
    "><div style="
      width:${dotSize}px;height:${dotSize}px;
      border-radius:50%;
      background:${isVisited ? 'white' : '#163A70'};
    "></div></div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createClusterIcon(cluster: any) {
  const count = cluster.getChildCount()
  const size = count < 10 ? 34 : count < 100 ? 40 : 48
  const fontSize = count < 10 ? 13 : count < 100 ? 12 : 11
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      background:rgba(13,27,42,0.82);
      border:2.5px solid rgba(255,255,255,0.9);
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 3px 12px rgba(0,0,0,0.35);
      cursor:pointer;
    "><span style="
      font-family:'Inter',sans-serif;
      font-size:${fontSize}px;
      font-weight:600;
      color:white;
      letter-spacing:-0.02em;
      line-height:1;
    ">${count}</span></div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function ClusterForcer() {
  const map = useMap()
  useEffect(() => {
    map.fire('zoomend')
  }, [map])
  return null
}

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
    <MapContainer center={FRANCE_CENTER} zoom={6} className="h-full w-full" zoomControl={false}>
      <TileLayer
        url={TILE_URL}
        attribution='© <a href="https://www.maptiler.com">MapTiler</a> © <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
        tileSize={512}
        zoomOffset={-1}
      />
      <ClusterForcer />
      <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={createClusterIcon}
        maxClusterRadius={60}
        spiderfyOnMaxZoom
        showCoverageOnHover={false}
        zoomToBoundsOnClick
      >
        {villages.map(v => (
          <Marker
            key={v.slug}
            position={[v.lat, v.lng]}
            icon={createVillageIcon(visitedSlugs.has(v.slug), activeSlug === v.slug)}
            eventHandlers={{ click: () => onVillageClick?.(v.slug) }}
          />
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  )
}
