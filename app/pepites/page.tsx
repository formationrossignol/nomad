'use client'
import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { PageTransition } from '@/components/layout/PageTransition'
import { PepiteCard } from '@/components/pepites/PepiteCard'
import { PEPITES, getUniquePepiteRegions } from '@/data/pepites'
import { useAuth } from '@/hooks/useAuth'
import { useVisitedPepites } from '@/hooks/useVisitedPepites'
import type { Pepite, PepiteFilterCategory } from '@/types'

const PepitesMap = dynamic(() => import('@/components/pepites/PepitesMap').then(m => m.PepitesMap), { ssr: false })

type FilterOption = 'Tous' | PepiteFilterCategory

const CATEGORY_FILTERS: FilterOption[] = [
  'Tous',
  'Plus beaux villages',
  'Villages',
  'Monuments & musées',
  'Châteaux',
  'Promenades',
  'Littoral & îles',
  'Parcs & jardins',
  'Grottes',
]

const allRegions = getUniquePepiteRegions()

export default function PepitesPage() {
  const { user } = useAuth()
  const { visitedSlugs, toggle } = useVisitedPepites()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<FilterOption>('Tous')
  const [activeRegion, setActiveRegion] = useState<string | null>(null)
  const [visitedFilter, setVisitedFilter] = useState<'all' | 'visited' | 'unvisited'>('all')
  const [selected, setSelected] = useState<Pepite | null>(null)

  const filtered = useMemo(() => {
    let result = PEPITES
    if (categoryFilter !== 'Tous') result = result.filter(p => p.filterCategory === categoryFilter)
    if (activeRegion) result = result.filter(p => p.region === activeRegion)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.region.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q)
      )
    }
    if (user && visitedFilter === 'visited') result = result.filter(p => visitedSlugs.has(p.slug))
    if (user && visitedFilter === 'unvisited') result = result.filter(p => !visitedSlugs.has(p.slug))
    return result
  }, [categoryFilter, activeRegion, search, visitedFilter, visitedSlugs, user])

  return (
    <PageTransition>
      <div className="h-screen pt-[52px] flex overflow-hidden">
        {/* Left — map 60% */}
        <div className="w-[60%] flex-shrink-0 relative">
          <PepitesMap
            pepites={filtered}
            activePepite={selected}
            onSelect={setSelected}
            className="h-full"
          />
        </div>

        {/* Right — panel 40% */}
        <div className="flex-1 flex flex-col overflow-hidden border-l border-sand/60">
          {/* Filters */}
          <div className="flex-shrink-0 p-6 border-b border-sand/40 space-y-4">
            {/* Search */}
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un lieu, une région…"
              className="w-full bg-transparent border-b border-sand font-cormorant italic text-[16px] text-deep-blue pb-1 focus:outline-none focus:border-deep-blue placeholder:text-stone/40"
            />

            {/* Category filter */}
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_FILTERS.map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setCategoryFilter(f)}
                  className={`font-inter text-[7.5px] tracking-[0.08em] uppercase px-2.5 py-1 border transition-colors duration-150 ${
                    categoryFilter === f
                      ? 'bg-deep-blue text-ivory border-deep-blue'
                      : 'bg-white text-stone border-sand hover:border-deep-blue hover:text-deep-blue'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Region filter */}
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {allRegions.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setActiveRegion(activeRegion === r ? null : r)}
                  className={`font-inter text-[7px] tracking-[0.08em] uppercase px-2 py-0.5 border transition-colors duration-150 ${
                    activeRegion === r
                      ? 'bg-champagne text-midnight border-champagne'
                      : 'bg-white text-stone border-sand/60 hover:border-stone'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Visited filter — auth-gated */}
            {user && (
              <div className="flex gap-2">
                {(['all', 'visited', 'unvisited'] as const).map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVisitedFilter(v)}
                    className={`font-inter text-[7.5px] tracking-[0.08em] uppercase px-2.5 py-1 border transition-colors duration-150 ${
                      visitedFilter === v
                        ? 'bg-deep-blue text-ivory border-deep-blue'
                        : 'bg-white text-stone border-sand hover:border-deep-blue'
                    }`}
                  >
                    {v === 'all' ? 'Tous' : v === 'visited' ? 'Visités' : 'Non visités'}
                  </button>
                ))}
              </div>
            )}

            <p className="font-inter text-[7.5px] tracking-[0.1em] text-stone">
              {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Card grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-3">
              {filtered.map(p => (
                <PepiteCard
                  key={p.id}
                  pepite={p}
                  visited={visitedSlugs.has(p.slug)}
                  onToggleVisited={user ? () => toggle(p.slug) : undefined}
                  active={selected?.id === p.id}
                  onClick={() => setSelected(selected?.id === p.id ? null : p)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
