'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { VisitedPepite } from '@/types'

export function useVisitedPepites() {
  const [visited, setVisited] = useState<Map<string, VisitedPepite>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('visited_pepites')
      .select('*')
      .then(({ data }) => {
        if (data) {
          setVisited(new Map(data.map((v: VisitedPepite) => [v.pepite_slug, v])))
        }
        setLoading(false)
      })
  }, [])

  const toggleVisited = useCallback(
    async (slug: string, visitedAt?: string, note?: string) => {
      if (visited.has(slug)) {
        await supabase.from('visited_pepites').delete().eq('pepite_slug', slug)
        setVisited(prev => {
          const next = new Map(prev)
          next.delete(slug)
          return next
        })
      } else {
        const record = {
          pepite_slug: slug,
          visited_at: visitedAt || new Date().toISOString().slice(0, 10),
          personal_note: note || null,
        }
        const { data } = await supabase
          .from('visited_pepites')
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

  const visitedSlugs = useMemo(() => new Set(visited.keys()), [visited])
  const getVisitedRecord = useCallback((slug: string) => visited.get(slug) ?? null, [visited])

  return {
    visited,
    loading,
    toggleVisited,
    visitedSlugs,
    getVisitedRecord,
  }
}
