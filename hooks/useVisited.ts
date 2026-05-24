'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { VisitedVillage } from '@/types'

export function useVisited() {
  const [visited, setVisited] = useState<Map<string, VisitedVillage>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('visited_villages')
      .select('*')
      .then(({ data }) => {
        if (data) {
          setVisited(new Map(data.map((v: VisitedVillage) => [v.village_slug, v])))
        }
        setLoading(false)
      })
  }, [])

  const toggleVisited = useCallback(
    async (slug: string, visitedAt?: string, note?: string) => {
      if (visited.has(slug)) {
        await supabase.from('visited_villages').delete().eq('village_slug', slug)
        setVisited(prev => {
          const next = new Map(prev)
          next.delete(slug)
          return next
        })
      } else {
        const record = {
          village_slug: slug,
          visited_at: visitedAt || new Date().toISOString().slice(0, 10),
          personal_note: note || null,
        }
        const { data } = await supabase
          .from('visited_villages')
          .insert(record)
          .select()
          .single()
        if (data) {
          setVisited(prev => new Map(prev).set(slug, data))
        }
      }
    },
    [visited]
  )

  return {
    visited,
    loading,
    toggleVisited,
    visitedSlugs: new Set(visited.keys()),
    getVisitedRecord: (slug: string) => visited.get(slug) ?? null,
  }
}
