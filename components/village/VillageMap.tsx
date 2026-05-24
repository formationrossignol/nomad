'use client'
import dynamic from 'next/dynamic'
import { ShimmerLoader } from '@/components/layout/ShimmerLoader'
import type { Village } from '@/types'

const VillageMapInner = dynamic(() => import('./VillageMapInner'), {
  ssr: false,
  loading: () => <ShimmerLoader className="h-full w-full" />,
})

interface VillageMapProps {
  villages: Village[]
  visitedSlugs: Set<string>
  activeSlug?: string | null
  onVillageClick?: (slug: string) => void
}

export function VillageMap(props: VillageMapProps) {
  return <VillageMapInner {...props} />
}
