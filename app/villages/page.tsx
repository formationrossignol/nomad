'use client'
import { useState, useMemo, useRef } from 'react'
import { PageTransition } from '@/components/layout/PageTransition'
import { VillageCard } from '@/components/village/VillageCard'
import { VillageMap } from '@/components/village/VillageMap'
import { useVisited } from '@/hooks/useVisited'
import { getAllVillages, getUniqueRegions } from '@/lib/villages'

const allVillages = getAllVillages()
const regions = getUniqueRegions()

export default function VillagesPage() {
  const { visitedSlugs, getVisitedRecord } = useVisited()
  const [search, setSearch] = useState('')
  const [activeRegion, setActiveRegion] = useState<string | null>(null)
  const [visitedFilter, setVisitedFilter] = useState<'all' | 'visited' | 'unvisited'>('all')
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const filtered = useMemo(() => {
    return allVillages.filter(v => {
      const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.department.toLowerCase().includes(search.toLowerCase())
      const matchRegion = !activeRegion || v.region === activeRegion
      const matchVisited =
        visitedFilter === 'all' ||
        (visitedFilter === 'visited' && visitedSlugs.has(v.slug)) ||
        (visitedFilter === 'unvisited' && !visitedSlugs.has(v.slug))
      return matchSearch && matchRegion && matchVisited
    })
  }, [search, activeRegion, visitedFilter, visitedSlugs])

  function handleMarkerClick(slug: string) {
    setActiveSlug(slug)
    const el = cardRefs.current[slug]
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  return (
    <PageTransition>
      <div className="flex h-screen pt-[52px]">
        {/* Map — 60% */}
        <div className="w-[60%] flex-shrink-0 relative">
          <VillageMap
            villages={filtered}
            visitedSlugs={visitedSlugs}
            activeSlug={activeSlug}
            onVillageClick={handleMarkerClick}
          />
        </div>

        {/* Right panel — 40% */}
        <div className="flex-1 flex flex-col border-l border-sand overflow-hidden">
          {/* Search + filters */}
          <div className="p-5 border-b border-sand/60 flex-shrink-0">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search villages…"
              className="w-full font-inter text-[12px] tracking-[0.05em] px-4 py-3 border border-sand rounded-none bg-white placeholder:text-stone focus:outline-none focus:border-cobalt transition-colors duration-200"
            />
            <div className="flex gap-2 mt-3 flex-wrap">
              {(['all', 'visited', 'unvisited'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setVisitedFilter(f)}
                  className={`font-inter text-[8px] tracking-[0.15em] uppercase px-3 py-1.5 border transition-colors duration-150 ${
                    visitedFilter === f
                      ? 'bg-deep-blue text-ivory border-deep-blue'
                      : 'bg-white text-stone border-sand hover:border-deep-blue hover:text-deep-blue'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Region filter chips */}
          <div className="px-5 py-3 border-b border-sand/40 flex-shrink-0 flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveRegion(null)}
              className={`font-inter text-[7.5px] tracking-[0.15em] uppercase px-2.5 py-1 border transition-colors duration-150 ${
                !activeRegion ? 'bg-deep-blue text-ivory border-deep-blue' : 'bg-white text-stone border-sand hover:border-deep-blue'
              }`}
            >
              All
            </button>
            {regions.map(r => (
              <button
                key={r}
                onClick={() => setActiveRegion(r === activeRegion ? null : r)}
                className={`font-inter text-[7.5px] tracking-[0.15em] uppercase px-2.5 py-1 border transition-colors duration-150 ${
                  activeRegion === r ? 'bg-deep-blue text-ivory border-deep-blue' : 'bg-white text-stone border-sand hover:border-deep-blue'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Village count */}
          <div className="px-5 py-2 border-b border-sand/30 flex-shrink-0">
            <p className="font-inter text-[9px] tracking-[0.12em] uppercase text-stone">
              {filtered.length} villages
            </p>
          </div>

          {/* Scrollable card list */}
          <div className="overflow-y-auto flex-1 grid grid-cols-2 gap-px bg-sand/30 content-start">
            {filtered.map(v => (
              <div
                key={v.slug}
                ref={el => { cardRefs.current[v.slug] = el }}
                className="bg-ivory"
                onClick={() => setActiveSlug(v.slug)}
              >
                <VillageCard
                  village={v}
                  visitedAt={getVisitedRecord(v.slug)?.visited_at}
                  isActive={activeSlug === v.slug}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
