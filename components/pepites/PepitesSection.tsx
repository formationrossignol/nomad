'use client'
import { useState } from 'react'
import { PepitesMap } from './PepitesMap'
import { PEPITES } from '@/data/pepites'
import type { Pepite, PepiteFilterCategory } from '@/types'

type FilterOption = 'Tous' | PepiteFilterCategory

const FILTERS: FilterOption[] = [
  'Tous',
  'Villages',
  'Monuments & musées',
  'Châteaux',
  'Promenades',
  'Littoral & îles',
  'Parcs & jardins',
  'Grottes',
]

const CATEGORY_COLOR: Record<PepiteFilterCategory, string> = {
  'Promenades':         '#4A7C59',
  'Grottes':            '#6D4C41',
  'Parcs & jardins':    '#2E7D32',
  'Villages':           '#163A70',
  'Châteaux':           '#6A1B9A',
  'Monuments & musées': '#BF360C',
  'Littoral & îles':    '#0277BD',
  'Plus beaux villages': '#9A7B2E',
}

export function PepitesSection() {
  const [activeFilter, setActiveFilter] = useState<FilterOption>('Tous')
  const [selected, setSelected] = useState<Pepite | null>(null)

  const filtered =
    activeFilter === 'Tous'
      ? PEPITES
      : PEPITES.filter(p => p.filterCategory === activeFilter)

  function handleFilterChange(f: FilterOption) {
    setActiveFilter(f)
    setSelected(null)
  }

  return (
    <section className="bg-ivory border-t border-sand py-14 px-12">
      {/* Header */}
      <div className="mb-8">
        <p className="font-inter text-[9px] tracking-[0.28em] uppercase text-deep-blue/40 mb-3">
          Découvrir
        </p>
        <h2 className="font-cormorant italic text-[38px] text-deep-blue leading-tight mb-3">
          Les nouvelles pépites de France
        </h2>
        <div className="w-8 h-px bg-champagne mb-4" />
        <p className="font-inter text-[11px] tracking-[0.04em] text-deep-blue/60 leading-relaxed max-w-2xl mb-2">
          Explorez les nouvelles pépites de France&nbsp;: promenades secrètes, villages de charme,
          grottes spectaculaires, jardins remarquables, châteaux méconnus et lieux culturels à
          redécouvrir.
        </p>
        <p className="font-inter text-[10px] tracking-[0.06em] text-stone">
          Filtrez la carte selon vos envies et trouvez votre prochaine escapade.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => handleFilterChange(f)}
            className={`font-inter text-[9px] tracking-[0.15em] uppercase px-4 py-1.5 rounded-full border transition-colors duration-150 ${
              activeFilter === f
                ? 'bg-deep-blue text-ivory border-deep-blue'
                : 'bg-transparent text-deep-blue border-deep-blue/30 hover:border-deep-blue/70'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Map + card */}
      <div className="relative h-[520px] border border-sand overflow-hidden">
        <PepitesMap pepites={filtered} selected={selected} onSelect={setSelected} />

        {selected && (
          <div
            className="absolute bottom-4 right-4 w-72 bg-white overflow-hidden"
            style={{ zIndex: 900, boxShadow: '0 4px 24px rgba(13,27,42,0.18)' }}
          >
            {/* Close */}
            <button
              onClick={() => setSelected(null)}
              className="absolute top-2 right-2 z-10 w-6 h-6 flex items-center justify-center bg-white/90 rounded-full font-inter text-[14px] text-midnight/60 hover:text-midnight leading-none"
              aria-label="Fermer"
            >
              ×
            </button>

            {/* Photo */}
            <div className="h-36 overflow-hidden">
              <img
                src={selected.imageUrl}
                alt={selected.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="mb-2">
                <span
                  className="font-inter text-[8px] tracking-[0.15em] uppercase px-2 py-0.5 text-white"
                  style={{ backgroundColor: CATEGORY_COLOR[selected.filterCategory] }}
                >
                  {selected.filterCategory}
                </span>
              </div>
              <h3 className="font-cormorant italic text-[18px] text-midnight leading-tight mb-1">
                {selected.name}
              </h3>
              <p className="font-inter text-[9px] tracking-[0.1em] text-stone uppercase mb-3">
                {selected.region} · {selected.department}
              </p>
              <p className="font-inter text-[10px] text-midnight/65 leading-relaxed mb-4 line-clamp-3">
                {selected.shortDescription}
              </p>
              <span className="font-inter text-[9px] tracking-[0.15em] uppercase text-deep-blue border-b border-deep-blue/40 pb-0.5">
                Découvrir →
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
