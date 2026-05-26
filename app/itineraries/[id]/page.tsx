import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { DayBlock } from '@/components/itinerary/DayBlock'
import { RouteMap } from '@/components/itinerary/RouteMap'
import { PageTransition } from '@/components/layout/PageTransition'
import { getAllVillages } from '@/lib/villages'
import { generateItinerary } from '@/lib/itinerary-algorithm'
import { getFuelPrice, ENERGIE_TO_FUEL, estimateFuelCost } from '@/lib/fuel-price'
import type { Itinerary, SavedVehicle } from '@/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: { id: string }
}

const VILLAGES_PER_DAY = { slow: 2, moderate: 3, intensive: 4 }

export default async function ItineraryDetailPage({ params }: Props) {
  const { id } = params
  const supabase = createSupabaseServerClient()

  const [{ data }, { data: vehicleData }] = await Promise.all([
    supabase.from('itineraries').select('*').eq('id', id).single(),
    supabase.from('user_vehicles').select('*').maybeSingle(),
  ])
  if (!data) notFound()

  const itinerary = data as Itinerary
  const vehicle = vehicleData as SavedVehicle | null
  const allVillages = getAllVillages()

  // Reconstruct days from stored village_slugs
  const orderedVillages = itinerary.village_slugs
    .map(slug => allVillages.find(v => v.slug === slug))
    .filter(Boolean) as typeof allVillages

  const pace = (itinerary.pace || 'moderate') as 'slow' | 'moderate' | 'intensive'
  const vpd = VILLAGES_PER_DAY[pace]

  const preview = generateItinerary(orderedVillages, {
    days: itinerary.days || Math.ceil(orderedVillages.length / vpd),
    styles: itinerary.style,
    pace,
  })

  // Fetch fuel price server-side if vehicle known
  const fuelParam = vehicle?.energie ? ENERGIE_TO_FUEL[vehicle.energie] : null
  const fuelPrice = fuelParam ? await getFuelPrice(fuelParam) : null
  const fuelCost =
    fuelPrice && vehicle?.conso_mixte && preview.totalDistanceKm > 0
      ? estimateFuelCost(preview.totalDistanceKm, vehicle.conso_mixte, fuelPrice.price)
      : null

  const heroVillage = orderedVillages[0]

  return (
    <PageTransition>
      {/* Hero */}
      {heroVillage && (
        <div className="relative h-[50vh] overflow-hidden">
          <img
            src={heroVillage.heroImage}
            alt={heroVillage.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-midnight/80 to-transparent" />
          <div className="absolute top-6 left-12">
            <Link
              href="/itineraries"
              className="font-inter text-[8px] tracking-[0.15em] uppercase text-ivory/60 hover:text-ivory transition-colors duration-150"
            >
              ← Mes itinéraires
            </Link>
          </div>
          <div className="absolute bottom-10 left-12">
            <p className="font-inter text-[8px] tracking-[0.22em] uppercase text-champagne/70 mb-3">
              Itinéraire
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
          {preview.days.map((day, i) => (
            <DayBlock
              key={day.dayNumber}
              day={day}
              departureCity={i === 0 && preview.departureCity ? preview.departureCity.name : undefined}
              returnLeg={
                i === preview.days.length - 1 && preview.departureCity && preview.returnTimeMinutes !== null
                  ? { city: preview.departureCity.name, minutes: preview.returnTimeMinutes }
                  : undefined
              }
            />
          ))}
        </div>

        {/* Right — route map + stats (sticky) */}
        <div className="no-print">
          <div className="sticky top-[72px]">
            <p className="font-inter text-[8px] tracking-[0.2em] uppercase text-stone mb-4">
              Itinéraire
            </p>
            <RouteMap
              days={preview.days}
              departureCity={preview.departureCity}
              className="h-80 border border-sand/60 mb-6"
            />
            <div className="space-y-2">
              <p className="font-inter text-[8px] tracking-[0.1em] text-stone">
                {preview.totalVillages} villages · {itinerary.days} jours · {pace === 'slow' ? 'lent' : pace === 'moderate' ? 'modéré' : 'intensif'}
              </p>
              <p className="font-inter text-[8px] tracking-[0.1em] text-stone">
                Distance totale : {preview.totalDistanceKm} km
              </p>
              {fuelCost !== null && vehicle && fuelPrice && (
                <div className="mt-4 pt-4 border-t border-sand/40">
                  <p className="font-inter text-[7.5px] tracking-[0.15em] uppercase text-stone mb-1">
                    Coût carburant estimé
                  </p>
                  <p className="font-cormorant italic text-[28px] text-deep-blue leading-none">
                    {fuelCost.toFixed(2)} €
                  </p>
                  <p className="font-inter text-[7px] tracking-[0.08em] text-stone/50 mt-1">
                    {vehicle.description_commerciale ?? `${vehicle.marque} ${vehicle.libelle_modele}`}
                    {' · '}{vehicle.conso_mixte} L/100km
                    {' · '}{fuelPrice.price.toFixed(3)} €/L
                    {' · '}
                    {fuelPrice.period === 'today' ? "Aujourd'hui" : fuelPrice.period === 'yesterday' ? 'Hier' : 'Dernières données'}
                  </p>
                </div>
              )}
              {!vehicle && (
                <p className="font-inter text-[7.5px] tracking-[0.1em] text-stone/50 mt-2">
                  <Link href="/account" className="underline hover:text-deep-blue transition-colors">
                    Renseignez votre véhicule
                  </Link>{' '}pour estimer le coût carburant.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
