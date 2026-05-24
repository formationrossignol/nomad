import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { DayBlock } from '@/components/itinerary/DayBlock'
import { RouteMap } from '@/components/itinerary/RouteMap'
import { PageTransition } from '@/components/layout/PageTransition'
import { getAllVillages } from '@/lib/villages'
import { generateItinerary } from '@/lib/itinerary-algorithm'
import type { Itinerary } from '@/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: { id: string }
}

const VILLAGES_PER_DAY = { slow: 2, moderate: 3, intensive: 4 }

export default async function ItineraryDetailPage({ params }: Props) {
  const { id } = params
  const supabase = createSupabaseServerClient()
  const { data } = await supabase.from('itineraries').select('*').eq('id', id).single()
  if (!data) notFound()

  const itinerary = data as Itinerary
  const allVillages = getAllVillages()

  // Reconstruct days from stored village_slugs
  const orderedVillages = itinerary.village_slugs
    .map(slug => allVillages.find(v => v.slug === slug))
    .filter(Boolean) as typeof allVillages

  const pace = (itinerary.pace || 'moderate') as 'slow' | 'moderate' | 'intensive'
  const vpd = VILLAGES_PER_DAY[pace]

  // Re-run algorithm with fixed slug order to get drive times
  const preview = generateItinerary(orderedVillages, {
    days: itinerary.days || Math.ceil(orderedVillages.length / vpd),
    styles: itinerary.style,
    pace,
  })

  const heroVillage = orderedVillages[0]

  return (
    <PageTransition>
      {/* Hero */}
      {heroVillage && (
        <div className="relative h-[50vh] overflow-hidden">
          <img
            src={`${heroVillage.heroImage}&w=1600&q=80`}
            alt={heroVillage.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-midnight/80 to-transparent" />
          <div className="absolute bottom-10 left-12">
            <p className="font-inter text-[8px] tracking-[0.22em] uppercase text-champagne/70 mb-3">
              Itinerary
            </p>
            <h1 className="font-cormorant italic text-[40px] text-ivory leading-tight">
              {itinerary.title}
            </h1>
          </div>
        </div>
      )}

      {/* Two-column magazine layout */}
      <div className="max-w-6xl mx-auto px-8 py-16 grid grid-cols-[1fr_420px] gap-16 print:grid-cols-1">
        {/* Left — day sequence */}
        <div>
          {preview.days.map(day => <DayBlock key={day.dayNumber} day={day} />)}
        </div>

        {/* Right — route map (sticky) */}
        <div className="no-print">
          <div className="sticky top-[72px]">
            <p className="font-inter text-[8px] tracking-[0.2em] uppercase text-stone mb-4">
              Route
            </p>
            <RouteMap
              days={preview.days}
              className="h-80 border border-sand/60 mb-6"
            />
            <div className="space-y-1">
              <p className="font-inter text-[8px] tracking-[0.1em] text-stone">
                {preview.totalVillages} villages · {itinerary.days} days · {pace}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
