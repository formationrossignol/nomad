'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { PageTransition } from '@/components/layout/PageTransition'
import { DayBlock } from '@/components/itinerary/DayBlock'
import { useVisited } from '@/hooks/useVisited'
import { getAllVillages, getUniqueRegions } from '@/lib/villages'
import { generateItinerary } from '@/lib/itinerary-algorithm'
import { supabase } from '@/lib/supabase/client'

const STYLE_OPTIONS = [
  { value: 'medieval', label: 'Villages cachés' },
  { value: 'gastronomy', label: 'Escapade gastronomique' },
  { value: 'wine', label: 'Route des vins' },
  { value: 'coastal', label: 'Villages côtiers' },
  { value: 'photography', label: 'Itinéraire photo' },
  { value: 'architectural', label: 'Découverte architecturale' },
  { value: 'hidden', label: 'Luxe discret' },
]

const DEPARTURE_CITIES = [
  { name: 'Paris', lat: 48.8566, lng: 2.3522 },
  { name: 'Lyon', lat: 45.7640, lng: 4.8357 },
  { name: 'Marseille', lat: 43.2965, lng: 5.3698 },
  { name: 'Toulouse', lat: 43.6047, lng: 1.4442 },
  { name: 'Bordeaux', lat: 44.8378, lng: -0.5792 },
  { name: 'Strasbourg', lat: 48.5734, lng: 7.7521 },
  { name: 'Nantes', lat: 47.2184, lng: -1.5536 },
  { name: 'Montpellier', lat: 43.6108, lng: 3.8767 },
  { name: 'Rennes', lat: 48.1173, lng: -1.6778 },
  { name: 'Dijon', lat: 47.3220, lng: 5.0415 },
  { name: 'Grenoble', lat: 45.1885, lng: 5.7245 },
  { name: 'Nice', lat: 43.7102, lng: 7.2620 },
  { name: 'Clermont-Ferrand', lat: 45.7797, lng: 3.0863 },
  { name: 'Limoges', lat: 45.8336, lng: 1.2611 },
  { name: 'Brest', lat: 48.3905, lng: -4.4860 },
  { name: 'Perpignan', lat: 42.6976, lng: 2.8954 },
  { name: 'Metz', lat: 49.1193, lng: 6.1757 },
  { name: 'Caen', lat: 49.1829, lng: -0.3707 },
  { name: 'Tours', lat: 47.3941, lng: 0.6848 },
  { name: 'Avignon', lat: 43.9493, lng: 4.8055 },
]

const allRegions = getUniqueRegions()
const allVillages = getAllVillages()

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h}h`
  return `${h}h${m.toString().padStart(2, '0')}`
}

export default function ItinerariesPage() {
  const { visitedSlugs } = useVisited()
  const router = useRouter()
  const [days, setDays] = useState(5)
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [styles, setStyles] = useState<string[]>([])
  const [pace, setPace] = useState<'slow' | 'moderate' | 'intensive'>('moderate')
  const [excludeVisited, setExcludeVisited] = useState(false)
  const [departureCity, setDepartureCity] = useState('')
  const [saving, setSaving] = useState(false)

  const selectedDeparture = DEPARTURE_CITIES.find(c => c.name === departureCity)

  const preview = useMemo(() => {
    return generateItinerary(allVillages, {
      days,
      regions: selectedRegions.length > 0 ? selectedRegions : undefined,
      styles,
      pace,
      excludeVisited: excludeVisited ? Array.from(visitedSlugs) : [],
      departureLat: selectedDeparture?.lat,
      departureLng: selectedDeparture?.lng,
      departureName: selectedDeparture?.name,
    })
  }, [days, selectedRegions, styles, pace, excludeVisited, visitedSlugs, selectedDeparture])

  function toggleStyle(val: string) {
    setStyles(prev => prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val])
  }

  function toggleRegion(r: string) {
    setSelectedRegions(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])
  }

  async function handleGenerate() {
    setSaving(true)
    const regionPart = selectedRegions.length === 1 ? ' en ' + selectedRegions[0] : ''
    const styleLabel = styles.length > 0 ? (STYLE_OPTIONS.find(s => s.value === styles[0])?.label ?? 'Découverte') : 'Découverte'
    const title = days + ' jours' + regionPart + ' — ' + styleLabel
    const villageSlugs = preview.days.flatMap(d => d.stops.map(s => s.village.slug))

    const { data, error } = await supabase
      .from('itineraries')
      .insert({ title, days, pace, style: styles, village_slugs: villageSlugs })
      .select()
      .single()

    if (!error && data) {
      router.push(`/itineraries/${data.id}`)
    } else {
      setSaving(false)
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-ivory pt-[52px] flex">
        {/* Left — inputs */}
        <div className="w-[380px] flex-shrink-0 border-r border-sand/60 p-10 overflow-y-auto">
          <p className="font-inter text-[9px] tracking-[0.25em] uppercase text-stone mb-6">
            Planifier
          </p>
          <h1 className="font-cormorant italic text-[34px] text-deep-blue leading-tight mb-12">
            Composer un itinéraire
          </h1>

          {/* Departure city */}
          <div className="mb-10">
            <label className="font-inter text-[8px] tracking-[0.2em] uppercase text-stone block mb-3">
              Ville de départ
            </label>
            <select
              value={departureCity}
              onChange={e => setDepartureCity(e.target.value)}
              className="w-full bg-transparent border-b border-sand font-cormorant italic text-[16px] text-deep-blue pb-1 focus:outline-none focus:border-deep-blue"
            >
              <option value="">Peu importe</option>
              {DEPARTURE_CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          {/* Days */}
          <div className="mb-10">
            <label className="font-inter text-[8px] tracking-[0.2em] uppercase text-stone block mb-3">
              Jours
            </label>
            <div className="flex items-baseline gap-4">
              <span className="font-cormorant italic text-[44px] text-deep-blue leading-none">{days}</span>
              <input
                type="range"
                min={2} max={10} value={days}
                onChange={e => setDays(Number(e.target.value))}
                className="flex-1 accent-deep-blue"
              />
            </div>
          </div>

          {/* Regions — multi-select */}
          <div className="mb-10">
            <label className="font-inter text-[8px] tracking-[0.2em] uppercase text-stone block mb-3">
              Régions {selectedRegions.length > 0 && <span className="text-deep-blue">({selectedRegions.length})</span>}
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
              {allRegions.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggleRegion(r)}
                  className={`font-inter text-[7.5px] tracking-[0.08em] uppercase px-2.5 py-1 border transition-colors duration-150 ${
                    selectedRegions.includes(r)
                      ? 'bg-deep-blue text-ivory border-deep-blue'
                      : 'bg-white text-stone border-sand hover:border-deep-blue hover:text-deep-blue'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Travel style */}
          <div className="mb-10">
            <label className="font-inter text-[8px] tracking-[0.2em] uppercase text-stone block mb-3">
              Style de voyage
            </label>
            <div className="flex flex-wrap gap-2">
              {STYLE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleStyle(opt.value)}
                  className={`font-inter text-[8px] tracking-[0.1em] uppercase px-3 py-1.5 border transition-colors duration-150 ${
                    styles.includes(opt.value)
                      ? 'bg-deep-blue text-ivory border-deep-blue'
                      : 'bg-white text-stone border-sand hover:border-deep-blue hover:text-deep-blue'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pace */}
          <div className="mb-10">
            <label className="font-inter text-[8px] tracking-[0.2em] uppercase text-stone block mb-3">
              Rythme
            </label>
            <div className="flex gap-2">
              {(['slow', 'moderate', 'intensive'] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPace(p)}
                  className={`flex-1 font-inter text-[8px] tracking-[0.1em] uppercase px-2 py-2 border transition-colors duration-150 ${
                    pace === p
                      ? 'bg-deep-blue text-ivory border-deep-blue'
                      : 'bg-white text-stone border-sand hover:border-deep-blue'
                  }`}
                >
                  {p === 'slow' ? 'Lent' : p === 'moderate' ? 'Modéré' : 'Intensif'}
                </button>
              ))}
            </div>
          </div>

          {/* Exclude visited */}
          <div className="mb-12 flex items-center gap-3">
            <input
              type="checkbox"
              id="excludeVisited"
              checked={excludeVisited}
              onChange={e => setExcludeVisited(e.target.checked)}
              className="accent-deep-blue"
            />
            <label htmlFor="excludeVisited" className="font-inter text-[9px] tracking-[0.1em] uppercase text-stone cursor-pointer">
              Exclure les villages déjà visités
            </label>
          </div>

          <button
            onClick={handleGenerate}
            disabled={saving || preview.totalVillages === 0}
            className="w-full font-inter text-[10px] tracking-[0.18em] uppercase py-4 bg-deep-blue text-ivory hover:bg-cobalt disabled:opacity-40 transition-colors duration-200"
          >
            {saving ? 'Génération…' : "Générer l'itinéraire"}
          </button>
        </div>

        {/* Right — live preview */}
        <div className="flex-1 overflow-y-auto p-10">
          <div className="flex items-baseline justify-between mb-2">
            <p className="font-inter text-[8px] tracking-[0.2em] uppercase text-stone">
              Aperçu — {preview.totalVillages} villages
            </p>
            {preview.returnTimeMinutes !== null && (
              <p className="font-inter text-[7.5px] tracking-[0.15em] uppercase text-stone">
                Retour {preview.departureCity?.name} : {formatDuration(preview.returnTimeMinutes)}
              </p>
            )}
          </div>
          <div className="w-full h-px bg-sand/60 mb-8" />
          {preview.totalVillages === 0 ? (
            <p className="font-cormorant italic text-[18px] text-stone">
              Ajustez vos filtres pour voir des villages.
            </p>
          ) : (
            preview.days.map(day => <DayBlock key={day.dayNumber} day={day} />)
          )}
        </div>
      </div>
    </PageTransition>
  )
}
