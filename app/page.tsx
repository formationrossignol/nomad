import Link from 'next/link'
import { PageTransition } from '@/components/layout/PageTransition'
import { HeroCarousel } from '@/components/layout/HeroCarousel'
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
            <p className="font-inter text-[9px] tracking-[0.28em] uppercase text-deep-blue/40 mb-8">
              Un monde de luxe discret
            </p>
            <h1 className="font-cormorant italic text-[52px] text-deep-blue leading-[1.05] mb-6">
              Beaux<br />Voyages
            </h1>
            <div className="w-8 h-px bg-champagne mb-6" />
            <p className="font-inter text-[11px] tracking-[0.06em] text-deep-blue/55 leading-relaxed mb-10">
              Un atlas cinématique du voyage en France<br />et des plus beaux villages de France.
            </p>
            <Link
              href="/villages"
              className="font-inter text-[10px] tracking-[0.18em] uppercase text-deep-blue border-b border-deep-blue pb-0.5 hover:text-cobalt hover:border-cobalt transition-colors duration-200"
            >
              Commencer l&apos;exploration
            </Link>
          </div>
        </div>

        {/* Right photo — carousel */}
        <HeroCarousel villageCount={villageCount} />
      </section>

      {/* FEATURE BLOCKS */}
      <section className="grid grid-cols-4 h-[220px]">
        {/* Block 1 — Design a Journey */}
        <Link href="/journeys/new" className="group relative flex flex-col justify-end p-8 bg-deep-blue overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'repeating-linear-gradient(90deg, #F7F5F1 0px, #F7F5F1 3px, transparent 3px, transparent 18px)' }}
            aria-hidden="true"
          />
          <p className="font-inter text-[8px] tracking-[0.22em] uppercase text-champagne/60 mb-3 relative z-10">
            Par ici
          </p>
          <h2 className="font-cormorant italic text-[22px] text-ivory leading-tight mb-4 relative z-10">
            Créer un voyage
          </h2>
          <span className="font-inter text-[9px] tracking-[0.15em] uppercase text-champagne border-b border-champagne/50 pb-0.5 w-fit relative z-10 group-hover:border-champagne transition-colors duration-200">
            Commencer <span aria-hidden="true">→</span>
          </span>
        </Link>

        {/* Block 2 — Villages */}
        <Link href="/villages" className="group relative flex flex-col justify-end p-8 bg-sand/40 overflow-hidden border-x border-sand">
          <p className="font-inter text-[8px] tracking-[0.22em] uppercase text-stone mb-3">
            Explorer
          </p>
          <h2 className="font-cormorant italic text-[22px] text-deep-blue leading-tight mb-4">
            {villageCount} Villages de France
          </h2>
          <span className="font-inter text-[9px] tracking-[0.15em] uppercase text-deep-blue border-b border-deep-blue/40 pb-0.5 w-fit group-hover:border-deep-blue transition-colors duration-200">
            Voir la carte <span aria-hidden="true">→</span>
          </span>
        </Link>

        {/* Block 3 — Plan an Itinerary */}
        <Link href="/itineraries" className="group relative flex flex-col justify-end p-8 bg-ivory overflow-hidden border-r border-sand">
          <p className="font-inter text-[8px] tracking-[0.22em] uppercase text-stone mb-3">
            Planifier
          </p>
          <h2 className="font-cormorant italic text-[22px] text-deep-blue leading-tight mb-4">
            Composer un itinéraire
          </h2>
          <span className="font-inter text-[9px] tracking-[0.15em] uppercase text-deep-blue border-b border-deep-blue/40 pb-0.5 w-fit group-hover:border-deep-blue transition-colors duration-200">
            Générer une route <span aria-hidden="true">→</span>
          </span>
        </Link>

        {/* Block 4 — Pépites */}
        <Link href="/pepites" className="group relative flex flex-col justify-end p-8 bg-sand/60 overflow-hidden border-r border-sand">
          <p className="font-inter text-[8px] tracking-[0.22em] uppercase text-stone mb-3">
            Découvrir
          </p>
          <h2 className="font-cormorant italic text-[22px] text-deep-blue leading-tight mb-4">
            Nouvelles pépites de France
          </h2>
          <span className="font-inter text-[9px] tracking-[0.15em] uppercase text-deep-blue border-b border-deep-blue/40 pb-0.5 w-fit group-hover:border-deep-blue transition-colors duration-200">
            Explorer la carte <span aria-hidden="true">→</span>
          </span>
        </Link>
      </section>

    </PageTransition>
  )
}
