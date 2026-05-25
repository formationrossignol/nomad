'use client'
import Link from 'next/link'

function NomadLogo() {
  return (
    <Link href="/" className="flex items-center gap-0 group" aria-label="NØmad — accueil">
      <span
        className="font-cormorant italic text-[20px] text-ivory leading-none tracking-tight"
        style={{ letterSpacing: '-0.01em' }}
      >
        N
      </span>
      <span
        className="font-cormorant italic text-[20px] leading-none"
        style={{
          color: '#D6C3A5',
          letterSpacing: '-0.01em',
        }}
      >
        ø
      </span>
      <span
        className="font-cormorant italic text-[20px] text-ivory/80 leading-none tracking-tight"
        style={{ letterSpacing: '-0.01em' }}
      >
        mad
      </span>
    </Link>
  )
}

export function NavBar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[52px] flex items-center justify-between px-8 bg-midnight/95 border-b border-champagne/10">
      <NomadLogo />
      <nav aria-label="Navigation du site" className="flex gap-7 items-center">
        <Link
          href="/villages"
          className="font-inter text-[9px] tracking-[0.2em] uppercase text-ivory/70 hover:text-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory/60 transition-colors duration-200"
        >
          Villages
        </Link>
        <Link
          href="/journeys"
          className="font-inter text-[9px] tracking-[0.2em] uppercase text-ivory/70 hover:text-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory/60 transition-colors duration-200"
        >
          Voyages
        </Link>
        <Link
          href="/itineraries"
          className="font-inter text-[9px] tracking-[0.2em] uppercase text-ivory/70 hover:text-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory/60 transition-colors duration-200"
        >
          Itinéraires
        </Link>
      </nav>
    </header>
  )
}
