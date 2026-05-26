'use client'
import { StripeAccent } from '@/components/ui/StripeAccent'
import type { Pepite, PepiteFilterCategory } from '@/types'

const CATEGORY_COLOR: Record<PepiteFilterCategory, string> = {
  'Promenades':          '#4A7C59',
  'Grottes':             '#6D4C41',
  'Parcs & jardins':     '#2E7D32',
  'Villages':            '#163A70',
  'Châteaux':            '#6A1B9A',
  'Monuments & musées':  '#BF360C',
  'Littoral & îles':     '#0277BD',
  'Plus beaux villages': '#9A7B2E',
}

interface PepiteCardProps {
  pepite: Pepite
  visited?: boolean
  active?: boolean
  onClick?: () => void
  onToggleVisited?: () => void
}

export function PepiteCard({ pepite, visited = false, active = false, onClick, onToggleVisited }: PepiteCardProps) {
  return (
    <div
      onClick={onClick}
      className={`group block cursor-pointer transition-opacity duration-200 ${active ? 'ring-2 ring-champagne' : ''}`}
    >
      <div className="relative overflow-hidden">
        <div className="relative h-[200px] overflow-hidden">
          <img
            src={pepite.imageUrl}
            alt={pepite.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-midnight/72 to-transparent" />

          <div className="absolute top-3 left-3">
            <span
              className="font-inter text-[7px] tracking-[0.15em] uppercase px-2 py-0.5 text-white"
              style={{ backgroundColor: CATEGORY_COLOR[pepite.filterCategory] }}
            >
              {pepite.filterCategory}
            </span>
          </div>

          {onToggleVisited && (
            <button
              onClick={e => { e.stopPropagation(); onToggleVisited() }}
              title={visited ? 'Marquer non visité' : 'Marquer visité'}
              className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                visited ? 'bg-champagne/90' : 'bg-midnight/50 hover:bg-champagne/70'
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 6l3 3 5-5" stroke={visited ? '#163A70' : 'white'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-3.5">
            <p className="font-inter text-[7.5px] tracking-[0.22em] uppercase text-champagne/80 mb-1">
              {pepite.region}
            </p>
            <h3 className="font-cormorant italic text-[15px] text-ivory leading-tight">
              {pepite.name}
            </h3>
            <p className="font-inter text-[8px] tracking-[0.1em] text-ivory/60 mt-1">
              {pepite.department}
            </p>
          </div>
        </div>

        <StripeAccent visited={visited} />
      </div>
    </div>
  )
}
