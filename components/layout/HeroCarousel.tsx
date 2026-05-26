'use client'
import { useState, useEffect, useCallback } from 'react'

const SLIDES = [
  {
    src: 'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=1600&q=85',
    village: 'Gordes',
    department: 'Vaucluse',
  },
  {
    src: 'https://images.unsplash.com/photo-1520466809213-7b9a56adcd45?w=1600&q=85',
    village: 'Rocamadour',
    department: 'Lot',
  },
  {
    src: 'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=1600&q=85',
    village: 'Saint-Cirq-Lapopie',
    department: 'Lot',
  },
  {
    src: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1600&q=85',
    village: 'Eguisheim',
    department: 'Haut-Rhin',
  },
  {
    src: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1600&q=85',
    village: 'La Roque-Gageac',
    department: 'Dordogne',
  },
  {
    src: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=85',
    village: 'Locronan',
    department: 'Finistère',
  },
]

const INTERVAL_MS = 5000

export function HeroCarousel() {
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)

  const advance = useCallback((next: number) => {
    setFading(true)
    setTimeout(() => {
      setCurrent(next)
      setFading(false)
    }, 600)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      advance((current + 1) % SLIDES.length)
    }, INTERVAL_MS)
    return () => clearInterval(timer)
  }, [current, advance])

  const slide = SLIDES[current]

  return (
    <div className="relative flex-1 overflow-hidden">
      {SLIDES.map((s, i) => (
        <img
          key={s.src}
          src={s.src}
          alt={s.village}
          className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700"
          style={{ opacity: i === current ? (fading ? 0 : 1) : 0 }}
        />
      ))}

      <div
        className="absolute inset-0 z-10"
        style={{ background: 'linear-gradient(90deg, #F7F5F1 0%, transparent 30%)' }}
        aria-hidden="true"
      />

      <div
        className="absolute bottom-8 left-8 z-20 transition-opacity duration-500"
        style={{ opacity: fading ? 0 : 1 }}
      >
        <p className="font-inter text-[7.5px] tracking-[0.2em] uppercase text-ivory/60">
          {slide.department}
        </p>
        <p className="font-cormorant italic text-[18px] text-ivory leading-tight">
          {slide.village}
        </p>
      </div>

      <div className="absolute bottom-8 right-8 z-20">
        <div className="flex gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => advance(i)}
              aria-label={SLIDES[i].village}
              className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{
                background: i === current ? 'rgba(210,180,140,0.9)' : 'rgba(255,255,255,0.3)',
                transform: i === current ? 'scale(1.3)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
