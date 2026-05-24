import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { HeroImage } from '@/components/ui/HeroImage'
import { MemoryBlock } from '@/components/journey/MemoryBlock'
import { JourneyMap } from '@/components/journey/JourneyMap'
import { PageTransition } from '@/components/layout/PageTransition'
import type { Journey, Memory } from '@/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: { id: string }
}

export default async function JourneyDetailPage({ params }: Props) {
  const { id } = params
  const supabase = createSupabaseServerClient()

  const [{ data: journey }, { data: memories }] = await Promise.all([
    supabase.from('journeys').select('*').eq('id', id).single(),
    supabase
      .from('memories')
      .select('*, memory_photos(*)')
      .eq('journey_id', id)
      .order('created_at', { ascending: true }),
  ])

  if (!journey) notFound()

  const typedJourney = journey as Journey
  const typedMemories = (memories || []) as Memory[]
  const heroSrc = typedJourney.hero_image_url ||
    'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=1600&q=80'

  return (
    <PageTransition>
      {/* Hero */}
      <HeroImage src={heroSrc} alt={typedJourney.title} className="h-[70vh] w-full" priority />

      {/* Journey header */}
      <div className="max-w-4xl mx-auto px-8 py-16">
        <p className="font-inter text-[9px] tracking-[0.25em] uppercase text-stone mb-4">
          {typedJourney.year && `${typedJourney.year} · `}{typedJourney.destination || 'Journey'}
        </p>
        <h1 className="font-cormorant italic text-[44px] text-deep-blue leading-tight mb-6">
          {typedJourney.title}
        </h1>
        {typedJourney.notes && (
          <>
            <div className="w-8 h-px bg-champagne mb-8" />
            <p className="font-cormorant text-[18px] text-midnight/80 leading-[1.8]">
              {typedJourney.notes}
            </p>
          </>
        )}
      </div>

      {/* Route map */}
      {typedMemories.some(m => m.lat && m.lng) && (
        <div className="max-w-4xl mx-auto px-8 mb-16">
          <p className="font-inter text-[8px] tracking-[0.2em] uppercase text-stone mb-4">
            Route
          </p>
          <JourneyMap memories={typedMemories} className="h-64 border border-sand/60" />
        </div>
      )}

      {/* Memory timeline */}
      <div className="max-w-4xl mx-auto px-8 pb-32">
        <p className="font-inter text-[9px] tracking-[0.22em] uppercase text-stone mb-2">
          Memories
        </p>
        <div className="w-full h-px bg-sand/60 mb-0" />
        {typedMemories.length === 0 ? (
          <p className="font-cormorant italic text-[18px] text-stone py-12">
            No memories yet — add your first.
          </p>
        ) : (
          typedMemories.map(m => <MemoryBlock key={m.id} memory={m} />)
        )}
      </div>

      {/* FAB — Add Memory */}
      <Link
        href={`/journeys/${id}/memory/new`}
        className="no-print fixed bottom-8 right-8 w-14 h-14 rounded-full bg-deep-blue text-ivory flex items-center justify-center shadow-lg hover:bg-cobalt transition-colors duration-200 z-40"
        aria-label="Add memory"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </Link>
    </PageTransition>
  )
}
