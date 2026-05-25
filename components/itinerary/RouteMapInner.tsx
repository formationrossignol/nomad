'use client'
import { MapContainer, TileLayer, Polyline } from 'react-leaflet'
import L from 'leaflet'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import type { ItineraryDay, DepartureCity } from '@/types'

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY
const TILE_URL = `https://api.maptiler.com/maps/positron/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`

interface MarkersProps {
  days: ItineraryDay[]
  departureCity?: DepartureCity | null
}

function RouteMarkers({ days, departureCity }: MarkersProps) {
  const map = useMap()
  const refs = useRef<(L.CircleMarker | L.Marker)[]>([])

  useEffect(() => {
    refs.current.forEach(m => m.remove())
    refs.current = []

    const allStops = days.flatMap(d => d.stops)

    // Village markers
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

    // Departure city marker (square-ish: larger, distinct color)
    if (departureCity) {
      const dep = L.circleMarker([departureCity.lat, departureCity.lng], {
        radius: 8,
        fillColor: '#163A70',
        fillOpacity: 1,
        color: '#D6C3A5',
        weight: 2,
      })
      dep.bindTooltip(`Départ : ${departureCity.name}`, { className: 'village-tooltip', direction: 'top' })
      dep.addTo(map)
      refs.current.push(dep)
    }

    // Fit bounds to include all stops + departure
    const boundsPoints: [number, number][] = allStops.map(s => [s.village.lat, s.village.lng])
    if (departureCity) boundsPoints.push([departureCity.lat, departureCity.lng])
    if (boundsPoints.length > 0) {
      const bounds = L.latLngBounds(boundsPoints)
      map.fitBounds(bounds, { padding: [40, 40] })
    }

    return () => { refs.current.forEach(m => m.remove()) }
  }, [days, departureCity, map])

  return null
}

interface RouteMapInnerProps {
  days: ItineraryDay[]
  departureCity?: DepartureCity | null
}

export default function RouteMapInner({ days, departureCity }: RouteMapInnerProps) {
  const allStops = days.flatMap(d => d.stops)
  const villagePositions: [number, number][] = allStops.map(s => [s.village.lat, s.village.lng])

  // Build full route: departure → villages → departure (round-trip)
  const routePositions: [number, number][] = departureCity
    ? [[departureCity.lat, departureCity.lng], ...villagePositions, [departureCity.lat, departureCity.lng]]
    : villagePositions

  return (
    <MapContainer center={[46.8, 2.3]} zoom={6} className="h-full w-full" zoomControl={false}>
      <TileLayer url={TILE_URL} attribution="© MapTiler © OpenStreetMap" tileSize={512} zoomOffset={-1} />
      {routePositions.length > 1 && (
        <Polyline
          positions={routePositions}
          pathOptions={{ color: '#D6C3A5', weight: 2.5, opacity: 0.9, dashArray: '8 10' }}
        />
      )}
      <RouteMarkers days={days} departureCity={departureCity} />
    </MapContainer>
  )
}
