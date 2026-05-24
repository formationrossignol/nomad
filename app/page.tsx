import Link from 'next/link'
import { HeroImage } from '@/components/ui/HeroImage'
import { PageTransition } from '@/components/layout/PageTransition'
import { getAllVillages } from '@/lib/villages'

export default function HomePage() {
  const villageCount = getAllVillages().length
  return (
    <PageTransition>
      {/* HERO — Asymmetric Atlas */}
      <section className="relative h-screen min-h-[600px] flex">
        {/* Left editorial panel */}
        <div className="relative z-10 flex flex-col justify-center px-12 w-[42%] flex-shrink-0">
          {/* Stripe wash */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, #163A70 0px, #163A70 3px, #F7F5F1 3px, #F7F5F1 18px)',
              opacity: 0.07,
            }}
            aria-hidden="true"
          />
          <div className="relative z-10">
            <p className="font-inter text-[9px] tracking-[0.28em] uppercase text-stone mb-8">
              A private luxury world
            </p>
            <h1 className="font-cormorant italic text-[52px] text-deep-blue leading-[1.05] mb-6">
              Beautiful<br />Journeys
            </h1>
            <div className="w-8 h-px bg-champagne mb-6" />
            <p className="font-inter text-[11px] tracking-[0.06em] text-stone leading-relaxed mb-10">
              A cinematic atlas of Mediterranean travel<br />and the most beautiful villages of France.
            </p>
            <Link
              href="/villages"
              className="font-inter text-[10px] tracking-[0.18em] uppercase text-deep-blue border-b border-deep-blue pb-0.5 hover:text-cobalt hover:border-cobalt transition-colors duration-200"
            >
              Begin Exploring
            </Link>
          </div>
        </div>

        {/* Right photo */}
        <div className="relative flex-1">
          <HeroImage
            src="/hero-beynac.jpg"
            alt="Beynac-et-Cazenac, Dordogne"
            className="absolute inset-0"
            priority
          />
          {/* Gradient bleed left */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(90deg, #F7F5F1 0%, transparent 25%)' }}
            aria-hidden="true"
          />
          {/* Village count badge */}
          <div className="absolute bottom-8 right-8 w-16 h-16 rounded-full bg-midnight/75 border border-champagne/30 flex flex-col items-center justify-center z-10">
            <span className="font-cormorant italic text-[20px] text-champagne leading-none">{villageCount}</span>
            <span className="font-inter text-[7px] tracking-[0.1em] uppercase text-stone mt-0.5">Villages</span>
          </div>
        </div>
      </section>

      {/* FEATURE BLOCKS */}
      <section className="grid grid-cols-3 h-[220px]">
        {/* Block 1 — Design a Journey */}
        <Link href="/journeys/new" className="group relative flex flex-col justify-end p-8 bg-deep-blue overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'repeating-linear-gradient(90deg, #F7F5F1 0px, #F7F5F1 3px, transparent 3px, transparent 18px)' }}
            aria-hidden="true"
          />
          <p className="font-inter text-[8px] tracking-[0.22em] uppercase text-champagne/60 mb-3 relative z-10">
            Start here
          </p>
          <h2 className="font-cormorant italic text-[22px] text-ivory leading-tight mb-4 relative z-10">
            Design a Journey
          </h2>
          <span className="font-inter text-[9px] tracking-[0.15em] uppercase text-champagne border-b border-champagne/50 pb-0.5 w-fit relative z-10 group-hover:border-champagne transition-colors duration-200">
            Create <span aria-hidden="true">→</span>
          </span>
        </Link>

        {/* Block 2 — 184 Villages */}
        <Link href="/villages" className="group relative flex flex-col justify-end p-8 bg-sand/40 overflow-hidden border-x border-sand">
          <p className="font-inter text-[8px] tracking-[0.22em] uppercase text-stone mb-3">
            Explorer
          </p>
          <h2 className="font-cormorant italic text-[22px] text-deep-blue leading-tight mb-4">
            {villageCount} Villages of France
          </h2>
          <span className="font-inter text-[9px] tracking-[0.15em] uppercase text-deep-blue border-b border-deep-blue/40 pb-0.5 w-fit group-hover:border-deep-blue transition-colors duration-200">
            Explore map <span aria-hidden="true">→</span>
          </span>
        </Link>

        {/* Block 3 — Plan an Itinerary */}
        <Link href="/itineraries" className="group relative flex flex-col justify-end p-8 bg-ivory overflow-hidden border-r border-sand">
          <p className="font-inter text-[8px] tracking-[0.22em] uppercase text-stone mb-3">
            Plan
          </p>
          <h2 className="font-cormorant italic text-[22px] text-deep-blue leading-tight mb-4">
            Plan an Itinerary
          </h2>
          <span className="font-inter text-[9px] tracking-[0.15em] uppercase text-deep-blue border-b border-deep-blue/40 pb-0.5 w-fit group-hover:border-deep-blue transition-colors duration-200">
            Generate route <span aria-hidden="true">→</span>
          </span>
        </Link>
      </section>
    </PageTransition>
  )
}
