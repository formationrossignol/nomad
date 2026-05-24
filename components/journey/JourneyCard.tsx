import Link from 'next/link'
import Image from 'next/image'
import { StripeAccent } from '@/components/ui/StripeAccent'
import type { Journey } from '@/types'

interface JourneyCardProps {
  journey: Journey
}

export function JourneyCard({ journey }: JourneyCardProps) {
  const imgSrc = journey.hero_image_url || 'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=800&q=70'

  return (
    <Link href={`/journeys/${journey.id}`} className="group block">
      <div className="relative overflow-hidden">
        <div className="relative overflow-hidden" style={{ paddingBottom: '66%' }}>
          <Image
            src={imgSrc}
            alt={journey.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-midnight/80 via-midnight/20 to-transparent" />

          {/* Year badge */}
          {journey.year && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-champagne/90 font-inter text-[9px] tracking-[0.12em] text-midnight">
              {journey.year}
            </div>
          )}

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            {journey.destination && (
              <p className="font-inter text-[7.5px] tracking-[0.2em] uppercase text-champagne/70 mb-2">
                {journey.destination}
              </p>
            )}
            <h3 className="font-cormorant italic text-[18px] text-ivory leading-tight">
              {journey.title}
            </h3>
          </div>
        </div>
        <StripeAccent visited />
      </div>
    </Link>
  )
}
