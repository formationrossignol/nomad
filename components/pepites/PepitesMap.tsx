'use client'
import dynamic from 'next/dynamic'
import { ShimmerLoader } from '@/components/layout/ShimmerLoader'
import type { Pepite } from '@/types'

const PepitesMapInner = dynamic(() => import('./PepitesMapInner'), {
  ssr: false,
  loading: () => <ShimmerLoader className="h-full w-full" />,
})

interface Props {
  pepites: Pepite[]
  selected: Pepite | null
  onSelect: (p: Pepite) => void
}

export function PepitesMap(props: Props) {
  return <PepitesMapInner {...props} />
}
