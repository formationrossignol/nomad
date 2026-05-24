'use client'
import dynamic from 'next/dynamic'
import { ShimmerLoader } from '@/components/layout/ShimmerLoader'
import type { Memory } from '@/types'

const JourneyMapInner = dynamic(() => import('./JourneyMapInner'), {
  ssr: false,
  loading: () => <ShimmerLoader className="h-full w-full" />,
})

interface JourneyMapProps {
  memories: Memory[]
  className?: string
}

export function JourneyMap({ memories, className = '' }: JourneyMapProps) {
  return (
    <div className={className}>
      <JourneyMapInner memories={memories} />
    </div>
  )
}
