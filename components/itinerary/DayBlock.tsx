import Link from 'next/link'
import type { ItineraryDay } from '@/types'

interface DayBlockProps {
  day: ItineraryDay
  departureCity?: string
  returnLeg?: { city: string; minutes: number }
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h}h`
  return `${h}h${m.toString().padStart(2, '0')}`
}

function TravelLeg({ from, to, minutes }: { from: string; to: string; minutes: number }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-sand/30">
      <div className="w-6 flex-shrink-0" />
      <p className="font-inter text-[7.5px] tracking-[0.15em] uppercase text-stone/60">
        {from} → → → {to} · {formatDuration(minutes)} en voiture
      </p>
    </div>
  )
}

export function DayBlock({ day, departureCity, returnLeg }: DayBlockProps) {
  return (
    <div className="py-10 border-b border-sand/40 last:border-0">
      <div className="flex items-baseline gap-4 mb-2">
        <h3 className="font-cormorant italic text-[28px] text-deep-blue leading-none">
          {day.label}
        </h3>
        <div className="h-px flex-1 bg-sand/60" />
        <span className="font-inter text-[7.5px] tracking-[0.15em] uppercase text-stone flex-shrink-0">
          ~{formatDuration(day.totalTimeMinutes)}
        </span>
      </div>
      <p className="font-cormorant italic text-[14px] text-stone mb-8">
        {day.atmosphereNote}
      </p>

      <div className="space-y-6">
        {departureCity && day.stops[0] && (
          <TravelLeg
            from={departureCity}
            to={day.stops[0].village.name}
            minutes={day.stops[0].driveTimeFromPrevMinutes ?? 0}
          />
        )}
        {day.stops.map((stop, i) => (
          <div key={stop.village.slug} className="flex gap-6">
            {/* Stop number */}
            <div className="w-6 flex-shrink-0 pt-1">
              <span className="font-cormorant italic text-[16px] text-champagne">{i + 1}</span>
            </div>
            {/* Village info */}
            <div className="flex-1">
              {stop.driveTimeFromPrevMinutes !== null && !departureCity && i === 0 && (
                <p className="font-inter text-[7.5px] tracking-[0.15em] uppercase text-stone mb-1">
                  {stop.driveTimeFromPrevMinutes} min en voiture
                </p>
              )}
              {stop.driveTimeFromPrevMinutes !== null && i > 0 && (
                <p className="font-inter text-[7.5px] tracking-[0.15em] uppercase text-stone mb-1">
                  {stop.driveTimeFromPrevMinutes} min en voiture
                </p>
              )}
              <Link
                href={`/villages/${stop.village.slug}`}
                className="font-cormorant italic text-[20px] text-deep-blue hover:text-cobalt transition-colors duration-200"
              >
                {stop.village.name}
              </Link>
              <div className="flex items-center gap-3 mt-0.5">
                <p className="font-inter text-[8px] tracking-[0.1em] text-stone">
                  {stop.village.department}
                </p>
                <span className="text-sand">·</span>
                <p className="font-inter text-[8px] tracking-[0.1em] text-stone">
                  {formatDuration(stop.visitDurationMinutes)} de visite
                </p>
              </div>
              <p className="font-cormorant text-[14px] text-midnight/70 leading-relaxed mt-2 line-clamp-2">
                {stop.village.description}
              </p>
            </div>
            {/* Village photo */}
            <div className="w-20 h-20 flex-shrink-0 overflow-hidden">
              <img
                src={stop.village.heroImage}
                alt={stop.village.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ))}
        {returnLeg && (
          <TravelLeg
            from={day.stops[day.stops.length - 1]?.village.name ?? ''}
            to={returnLeg.city}
            minutes={returnLeg.minutes}
          />
        )}
      </div>
    </div>
  )
}
