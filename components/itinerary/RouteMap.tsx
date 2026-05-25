'use client'
import dynamic from 'next/dynamic'
import { ShimmerLoader } from '@/components/layout/ShimmerLoader'
import type { ItineraryDay, DepartureCity } from '@/types'

const RouteMapInner = dynamic(() => import('./RouteMapInner'), {
  ssr: false,
  loading: () => <ShimmerLoader className="h-full w-full" />,
})

interface RouteMapProps {
  days: ItineraryDay[]
  departureCity?: DepartureCity | null
  className?: string
}

export function RouteMap({ days, departureCity, className = '' }: RouteMapProps) {
  return (
    <div className={className}>
      <RouteMapInner days={days} departureCity={departureCity} />
    </div>
  )
}
