'use client'
import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import 'react-leaflet-cluster/lib/assets/MarkerCluster.css'
import 'react-leaflet-cluster/lib/assets/MarkerCluster.Default.css'
import type { Pepite, PepiteFilterCategory } from '@/types'

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY
const TILE_URL = `https://api.maptiler.com/maps/positron/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`
const FRANCE_CENTER: [number, number] = [46.8, 2.3]

const CATEGORY_STYLE: Record<PepiteFilterCategory, { bg: string; emoji: string }> = {
  'Promenades':        { bg: '#4A7C59', emoji: '🥾' },
  'Grottes':           { bg: '#6D4C41', emoji: '🕳️' },
  'Parcs & jardins':   { bg: '#2E7D32', emoji: '🌿' },
  'Villages':          { bg: '#163A70', emoji: '🏠' },
  'Châteaux':          { bg: '#6A1B9A', emoji: '🏰' },
  'Monuments & musées':{ bg: '#BF360C', emoji: '🏛️' },
  'Littoral & îles':   { bg: '#0277BD', emoji: '🏖️' },
  'Plus beaux villages': { bg: '#9A7B2E', emoji: '⭐' },
}

function createIcon(category: PepiteFilterCategory, active: boolean) {
  const { bg, emoji } = CATEGORY_STYLE[category]
  const size = active ? 36 : 28
  const border = active ? '3px solid white' : '2px solid white'
  const shadow = active
    ? '0 3px 10px rgba(0,0,0,0.45)'
    : '0 2px 5px rgba(0,0,0,0.25)'
  return L.divIcon({
    html: `<div style="background:${bg};width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${active ? 17 : 13}px;border:${border};box-shadow:${shadow};cursor:pointer;transition:all .15s;">${emoji}</div>`,
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

interface Props {
  pepites: Pepite[]
  selected: Pepite | null
  onSelect: (p: Pepite) => void
}

function ClusterForcer() {
  const map = useMap()
  useEffect(() => {
    map.fire('zoomend')
  }, [map])
  return null
}

export default function PepitesMapInner({ pepites, selected, onSelect }: Props) {
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
        {pepites.map(p => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={createIcon(p.filterCategory, selected?.id === p.id)}
            eventHandlers={{ click: () => onSelect(p) }}
          />
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  )
}
