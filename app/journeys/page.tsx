import { createSupabaseServerClient } from '@/lib/supabase/server'
import { JourneyCard } from '@/components/journey/JourneyCard'
import { PageTransition } from '@/components/layout/PageTransition'
import Link from 'next/link'
import type { Journey } from '@/types'

export const dynamic = 'force-dynamic'

export default async function JourneysPage() {
  const supabase = createSupabaseServerClient()
  const { data: journeys } = await supabase
    .from('journeys')
    .select('*')
    .order('created_at', { ascending: false })

  const allJourneys = (journeys || []) as Journey[]

  return (
    <PageTransition>
      <div className="min-h-screen bg-ivory pt-[52px]">
        {/* Header */}
        <div className="px-12 py-16 flex items-end justify-between border-b border-sand/60">
          <div>
            <p className="font-inter text-[9px] tracking-[0.25em] uppercase text-stone mb-4">
              Your archive
            </p>
            <h1 className="font-cormorant italic text-[44px] text-deep-blue leading-tight">
              Journeys
            </h1>
          </div>
          <Link
            href="/journeys/new"
            className="font-inter text-[9px] tracking-[0.18em] uppercase px-6 py-3 bg-deep-blue text-ivory hover:bg-cobalt transition-colors duration-200"
          >
            New Journey
          </Link>
        </div>

        {/* Grid */}
        <div className="px-12 py-12">
          {allJourneys.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-cormorant italic text-[22px] text-stone">
                Your first journey awaits.
              </p>
              <Link
                href="/journeys/new"
                className="inline-block mt-6 font-inter text-[9px] tracking-[0.18em] uppercase text-deep-blue border-b border-deep-blue pb-0.5"
              >
                Begin <span aria-hidden="true">→</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {allJourneys.map(j => (
                <JourneyCard key={j.id} journey={j} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
