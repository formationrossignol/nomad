'use client'
import { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import { HeroImage } from '@/components/ui/HeroImage'
import { VillageCard } from '@/components/village/VillageCard'
import { VisitedToggle } from '@/components/forms/VisitedToggle'
import { PageTransition } from '@/components/layout/PageTransition'
import { useVisited } from '@/hooks/useVisited'
import { getVillageBySlug, getNearbyVillages } from '@/lib/villages'
import { supabase } from '@/lib/supabase/client'

interface Props {
  params: { slug: string }
}

export default function VillageDetailPage({ params }: Props) {
  const { slug } = params
  const village = getVillageBySlug(slug)
  const { visitedSlugs, getVisitedRecord, toggleVisited } = useVisited()
  const [note, setNote] = useState('')
  const [noteSaved, setNoteSaved] = useState(false)

  const visitedRecord = village ? getVisitedRecord(village.slug) : null
  const isVisited = village ? visitedSlugs.has(village.slug) : false
  const nearby = village ? getNearbyVillages(village, 4) : []

  useEffect(() => {
    if (visitedRecord?.personal_note) setNote(visitedRecord.personal_note)
  }, [visitedRecord])

  if (!village) notFound()

  async function saveNote() {
    await supabase
      .from('visited_villages')
      .update({ personal_note: note })
      .eq('village_slug', village!.slug)
    setNoteSaved(true)
    setTimeout(() => setNoteSaved(false), 2000)
  }

  return (
    <PageTransition>
      {/* Hero */}
      <HeroImage
        src={village.heroImage}
        alt={village.name}
        className="h-[65vh] w-full"
        priority
      />

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 py-16 grid grid-cols-2 gap-16">
        {/* Left — editorial text */}
        <div>
          <p className="font-inter text-[9px] tracking-[0.25em] uppercase text-stone mb-4">
            {village.region} · {village.department}
          </p>
          <h1 className="font-cormorant italic text-[42px] text-deep-blue leading-tight mb-6">
            {village.name}
          </h1>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-8 h-px bg-champagne flex-shrink-0" />
            <p className="font-inter text-[8px] tracking-[0.18em] uppercase text-stone">
              {(() => {
                const h = Math.floor(village.visitDurationMinutes / 60)
                const m = village.visitDurationMinutes % 60
                return h > 0 ? `${h}h${m > 0 ? m.toString().padStart(2, '0') : ''}` : `${m} min`
              })()} de visite conseillée
            </p>
          </div>
          <p className="font-cormorant text-[17px] text-midnight/80 leading-[1.8] mb-10">
            {village.description}
          </p>
          <VisitedToggle
            isVisited={isVisited}
            onToggle={() => toggleVisited(village.slug)}
          />

          {/* Personal notes */}
          <div className="mt-10">
            <label className="font-inter text-[8px] tracking-[0.2em] uppercase text-stone block mb-3">
              Vos souvenirs
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              onBlur={isVisited ? saveNote : undefined}
              placeholder="Vos souvenirs de ce village…"
              rows={4}
              className="w-full font-cormorant text-[16px] text-midnight/80 leading-[1.8] bg-transparent border-0 border-b border-sand/60 focus:outline-none focus:border-deep-blue resize-none placeholder:text-stone/50 pb-2 transition-colors duration-200"
            />
            {noteSaved && (
              <p className="font-inter text-[8px] tracking-[0.1em] uppercase text-champagne mt-1">Sauvegardé</p>
            )}
          </div>
        </div>

        {/* Right — photos placeholder */}
        <div>
          <p className="font-inter text-[8px] tracking-[0.2em] uppercase text-stone mb-6">
            Vos photos
          </p>
          <div className="h-64 border border-dashed border-sand flex items-center justify-center">
            <p className="font-cormorant italic text-[14px] text-stone">
              Les photos liées à vos souvenirs apparaissent ici
            </p>
          </div>
        </div>
      </div>

      {/* Nearby villages */}
      <div className="border-t border-sand/60 py-16">
        <div className="max-w-6xl mx-auto px-8">
          <p className="font-inter text-[9px] tracking-[0.22em] uppercase text-stone mb-8">
            Villages proches
          </p>
          <div className="grid grid-cols-4 gap-4">
            {nearby.map(v => (
              <VillageCard
                key={v.slug}
                village={v}
                visitedAt={getVisitedRecord(v.slug)?.visited_at}
              />
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
