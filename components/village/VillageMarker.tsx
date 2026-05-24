'use client'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Village } from '@/types'

interface VillageMarkerProps {
  village: Village
  isVisited: boolean
  isActive: boolean
  onClick: () => void
}

export function VillageMarker({ village, isVisited, isActive, onClick }: VillageMarkerProps) {
  const map = useMap()
  const markerRef = useRef<L.CircleMarker | null>(null)

  useEffect(() => {
    const radius = isActive ? 8 : 5
    const marker = L.circleMarker([village.lat, village.lng], {
      radius,
      fillColor: isVisited ? '#163A70' : 'transparent',
      fillOpacity: isVisited ? 1 : 0,
      color: '#163A70',
      weight: 1.5,
    })

    marker.on('click', onClick)
    marker.bindTooltip(village.name, {
      permanent: false,
      direction: 'top',
      className: 'village-tooltip',
    })
    marker.addTo(map)
    markerRef.current = marker

    return () => { marker.remove() }
  }, [village, isVisited, isActive, map, onClick])

  return null
}
