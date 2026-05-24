import Link from 'next/link'
import type { ItineraryDay } from '@/types'

interface DayBlockProps {
  day: ItineraryDay
}

export function DayBlock({ day }: DayBlockProps) {
  return (
    <div className="py-10 border-b border-sand/40 last:border-0">
      <div className="flex items-baseline gap-4 mb-2">
        <h3 className="font-cormorant italic text-[28px] text-deep-blue leading-none">
          {day.label}
        </h3>
        <div className="h-px flex-1 bg-sand/60" />
      </div>
      <p className="font-cormorant italic text-[14px] text-stone mb-8">
        {day.atmosphereNote}
      </p>

      <div className="space-y-6">
        {day.stops.map((stop, i) => (
          <div key={stop.village.slug} className="flex gap-6">
            {/* Stop number */}
            <div className="w-6 flex-shrink-0 pt-1">
              <span className="font-cormorant italic text-[16px] text-champagne">{i + 1}</span>
            </div>
            {/* Village info */}
            <div className="flex-1">
              {stop.driveTimeFromPrevMinutes !== null && (
                <p className="font-inter text-[7.5px] tracking-[0.15em] uppercase text-stone mb-1">
                  {stop.driveTimeFromPrevMinutes} min drive
                </p>
              )}
              <Link
                href={`/villages/${stop.village.slug}`}
                className="font-cormorant italic text-[20px] text-deep-blue hover:text-cobalt transition-colors duration-200"
              >
                {stop.village.name}
              </Link>
              <p className="font-inter text-[8px] tracking-[0.1em] text-stone mt-0.5">
                {stop.village.department}
              </p>
              <p className="font-cormorant text-[14px] text-midnight/70 leading-relaxed mt-2 line-clamp-2">
                {stop.village.description}
              </p>
            </div>
            {/* Village photo */}
            <div className="w-20 h-20 flex-shrink-0 overflow-hidden">
              <img
                src={`${stop.village.heroImage}&w=120&q=60`}
                alt={stop.village.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
