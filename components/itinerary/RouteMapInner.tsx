'use client'
import { MapContainer, TileLayer, Polyline } from 'react-leaflet'
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
