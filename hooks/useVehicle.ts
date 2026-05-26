'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { SavedVehicle } from '@/types'

export function useVehicle() {
  const [vehicle, setVehicle] = useState<SavedVehicle | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('user_vehicles')
      .select('*')
      .maybeSingle()
      .then(({ data }) => {
        setVehicle(data as SavedVehicle | null)
        setLoading(false)
      })
  }, [])

  const saveVehicle = useCallback(async (v: Omit<SavedVehicle, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('user_vehicles')
      .upsert(v, { onConflict: 'user_id' })
      .select()
      .single()
    if (!error && data) setVehicle(data as SavedVehicle)
    return !error
  }, [])

  const deleteVehicle = useCallback(async () => {
    await supabase.from('user_vehicles').delete().neq('id', '')
    setVehicle(null)
  }, [])

  return { vehicle, loading, saveVehicle, deleteVehicle }
}
