'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { PageTransition } from '@/components/layout/PageTransition'
import { DayBlock } from '@/components/itinerary/DayBlock'
import { RouteMap } from '@/components/itinerary/RouteMap'
import { useVisited } from '@/hooks/useVisited'
import { getAllVillages, getUniqueRegions } from '@/lib/villages'
import { generateItinerary } from '@/lib/itinerary-algorithm'
import { supabase } from '@/lib/supabase/client'

const STYLE_OPTIONS = [
  { value: 'medieval', label: 'Hidden Villages' },
  { value: 'gastronomy', label: 'Gastronomy Escape' },
  { value: 'wine', label: 'Wine Journey' },
  { value: 'coastal', label: 'Coastal Villages' },
  { value: 'photography', label: 'Photography Route' },
  { value: 'architectural', label: 'Architectural Discovery' },
  { value: 'hidden', label: 'Slow Luxury' },
]

const regions = getUniqueRegions()
const allVillages = getAllVillages()

export default function ItinerariesPage() {
  const { visitedSlugs } = useVisited()
  const router = useRouter()
  const [days, setDays] = useState(5)
  const [region, setRegion] = useState('')
  const [styles, setStyles] = useState<string[]>([])
  const [pace, setPace] = useState<'slow' | 'moderate' | 'intensive'>('moderate')
  const [excludeVisited, setExcludeVisited] = useState(false)
  const [saving, setSaving] = useState(false)

  const preview = useMemo(() => {
    return generateItinerary(allVillages, {
      days,
      region: region || undefined,
      styles,
      pace,
      excludeVisited: excludeVisited ? Array.from(visitedSlugs) : [],
    })
  }, [days, region, styles, pace, excludeVisited, visitedSlugs])

  function toggleStyle(val: string) {
    setStyles(prev =>
      prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val]
    )
  }

  async function handleGenerate() {
    setSaving(true)
    const title = `${days} Days${region ? ` in ${region}` : ''} — ${styles.length > 0 ? STYLE_OPTIONS.find(s => s.value === styles[0])?.label : 'Discovery'}`
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
            Plan
          </p>
          <h1 className="font-cormorant italic text-[34px] text-deep-blue leading-tight mb-12">
            Compose an Itinerary
          </h1>

          {/* Days */}
          <div className="mb-10">
            <label className="font-inter text-[8px] tracking-[0.2em] uppercase text-stone block mb-3">
              Days
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

          {/* Region */}
          <div className="mb-10">
            <label className="font-inter text-[8px] tracking-[0.2em] uppercase text-stone block mb-3">
              Departure region
            </label>
            <select
              value={region}
              onChange={e => setRegion(e.target.value)}
              className="w-full bg-transparent border-b border-sand font-cormorant italic text-[16px] text-deep-blue pb-1 focus:outline-none focus:border-deep-blue"
            >
              <option value="">Any region</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Travel style */}
          <div className="mb-10">
            <label className="font-inter text-[8px] tracking-[0.2em] uppercase text-stone block mb-3">
              Travel style
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
              Pace
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
                  {p}
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
              Exclude already visited
            </label>
          </div>

          <button
            onClick={handleGenerate}
            disabled={saving || preview.totalVillages === 0}
            className="w-full font-inter text-[10px] tracking-[0.18em] uppercase py-4 bg-deep-blue text-ivory hover:bg-cobalt disabled:opacity-40 transition-colors duration-200"
          >
            {saving ? 'Generating…' : 'Generate Itinerary'}
          </button>
        </div>

        {/* Right — live preview */}
        <div className="flex-1 overflow-y-auto p-10">
          <p className="font-inter text-[8px] tracking-[0.2em] uppercase text-stone mb-2">
            Preview — {preview.totalVillages} villages
          </p>
          <div className="w-full h-px bg-sand/60 mb-8" />
          {preview.totalVillages === 0 ? (
            <p className="font-cormorant italic text-[18px] text-stone">
              Adjust your filters to see villages.
            </p>
          ) : (
            preview.days.map(day => <DayBlock key={day.dayNumber} day={day} />)
          )}
        </div>
      </div>
    </PageTransition>
  )
}
