'use client'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'

export function NavBar() {
  const { scrollY } = useScroll()
  const bgOpacity = useTransform(scrollY, [0, 80], [0, 1])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[52px] flex items-center justify-between px-8">
      <motion.div
        className="absolute inset-0 bg-midnight"
        style={{ opacity: bgOpacity }}
      />
      <Link
        href="/"
        className="relative z-10 font-cormorant italic text-[14px] tracking-[0.15em] text-ivory"
      >
        Voyages
      </Link>
      <nav aria-label="Site navigation" className="relative z-10 flex gap-7 items-center">
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
          Journeys
        </Link>
        <Link
          href="/itineraries"
          className="font-inter text-[9px] tracking-[0.2em] uppercase text-ivory/70 hover:text-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory/60 transition-colors duration-200"
        >
          Itineraries
        </Link>
      </nav>
    </header>
  )
}
