'use client'
import { MapContainer, TileLayer, Polyline } from 'react-leaflet'
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
