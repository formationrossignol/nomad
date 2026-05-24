import Link from 'next/link'
import Image from 'next/image'
import { StripeAccent } from '@/components/ui/StripeAccent'
import type { Village } from '@/types'

interface VillageCardProps {
  village: Village
  visitedAt?: string | null
  isActive?: boolean
}

export function VillageCard({ village, visitedAt, isActive = false }: VillageCardProps) {
  const isVisited = Boolean(visitedAt)

  return (
    <Link
      href={`/villages/${village.slug}`}
      className={`group block transition-opacity duration-200 ${isActive ? 'ring-2 ring-champagne' : ''}`}
    >
      <div className="relative overflow-hidden">
        {/* Photo */}
        <div className="relative h-[240px] overflow-hidden">
          <Image
            src={village.heroImage}
            alt={village.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-midnight/72 to-transparent" />

          {/* Visited badge */}
          {isVisited && (
            <div
              title="Visited"
              className="absolute top-3 right-3 w-6 h-6 rounded-full bg-champagne/90 flex items-center justify-center"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 6l3 3 5-5" stroke="#163A70" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}

          {/* Text overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3.5">
            <p className="font-inter text-[7.5px] tracking-[0.22em] uppercase text-champagne/80 mb-1">
              {village.region}
            </p>
            <h3 className="font-cormorant italic text-[15px] text-ivory leading-tight">
              {village.name}
            </h3>
            <p className="font-inter text-[8px] tracking-[0.1em] text-ivory/60 mt-1">
              {village.department}
              {visitedAt ? ` · Visited ${visitedAt.slice(0, 4)}` : ''}
            </p>
          </div>
        </div>

        {/* Stripe accent */}
        <StripeAccent visited={isVisited} />
      </div>
    </Link>
  )
}
