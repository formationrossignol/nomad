'use client'
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY
const TILE_URL = `https://api.maptiler.com/maps/positron/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`

interface ClickHandlerProps {
  onChange: (coords: { lat: number; lng: number }) => void
  value: { lat: number; lng: number } | null
}

function ClickHandler({ onChange, value }: ClickHandlerProps) {
  const map = useMap()
  const markerRef = useRef<L.CircleMarker | null>(null)

  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })

  useEffect(() => {
    markerRef.current?.remove()
    if (value) {
      const m = L.circleMarker([value.lat, value.lng], {
        radius: 7, fillColor: '#163A70', fillOpacity: 1, color: '#F7F5F1', weight: 2,
      }).addTo(map)
      markerRef.current = m
    }
    return () => { markerRef.current?.remove() }
  }, [value, map])

  return null
}

interface LocationPickerProps {
  value: { lat: number; lng: number } | null
  onChange: (coords: { lat: number; lng: number }) => void
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  return (
    <MapContainer center={[46.8, 2.3]} zoom={5} className="h-48 w-full" zoomControl={false}>
      <TileLayer url={TILE_URL} attribution="© MapTiler © OpenStreetMap" tileSize={512} zoomOffset={-1} />
      <ClickHandler onChange={onChange} value={value} />
    </MapContainer>
  )
}
