'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PageTransition } from '@/components/layout/PageTransition'
import { supabase } from '@/lib/supabase/client'
import type { Itinerary } from '@/types'

function ItinerariesContent() {

  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('itineraries')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setItineraries((data as Itinerary[]) ?? [])
        setLoading(false)
      })
  }, [])

  async function handleDelete(id: string) {
    setDeleting(id)
    await supabase.from('itineraries').delete().eq('id', id)
    setItineraries(prev => prev.filter(it => it.id !== id))
    setDeleting(null)
  }

  return (
    <div className="min-h-screen bg-ivory pt-[52px] px-12 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-baseline justify-between mb-12">
          <div>
            <p className="font-inter text-[9px] tracking-[0.28em] uppercase text-deep-blue/40 mb-3">
              Mes itinéraires
            </p>
            <h1 className="font-cormorant italic text-[38px] text-deep-blue leading-tight">
              Itinéraires sauvegardés
            </h1>
          </div>
          <Link
            href="/itineraries/new"
            className="font-inter text-[9px] tracking-[0.18em] uppercase px-6 py-3 bg-deep-blue text-ivory hover:bg-cobalt transition-colors duration-200"
          >
            + Nouvel itinéraire
          </Link>
        </div>

        {loading ? (
          <p className="font-cormorant italic text-[18px] text-stone">Chargement…</p>
        ) : itineraries.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-cormorant italic text-[22px] text-stone mb-6">
              Aucun itinéraire sauvegardé
            </p>
            <Link
              href="/itineraries/new"
              className="font-inter text-[9px] tracking-[0.18em] uppercase border-b border-deep-blue text-deep-blue pb-0.5 hover:text-cobalt hover:border-cobalt transition-colors"
            >
              Créer votre premier itinéraire →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {itineraries.map(it => (
              <div key={it.id} className="border border-sand/60 p-6 bg-white">
                <p className="font-inter text-[7.5px] tracking-[0.15em] uppercase text-stone mb-2">
                  {new Date(it.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <h2 className="font-cormorant italic text-[20px] text-deep-blue leading-tight mb-4">
                  {it.title ?? 'Itinéraire sans titre'}
                </h2>
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {it.days && (
                    <span className="font-inter text-[7px] tracking-[0.1em] uppercase px-2 py-0.5 border border-sand text-stone">
                      {it.days} jours
                    </span>
                  )}
                  {it.pace && (
                    <span className="font-inter text-[7px] tracking-[0.1em] uppercase px-2 py-0.5 border border-sand text-stone">
                      {it.pace === 'slow' ? 'Lent' : it.pace === 'moderate' ? 'Modéré' : 'Intensif'}
                    </span>
                  )}
                  {it.style?.map(s => (
                    <span key={s} className="font-inter text-[7px] tracking-[0.1em] uppercase px-2 py-0.5 border border-sand text-stone">
                      {s}
                    </span>
                  ))}
                  <span className="font-inter text-[7px] tracking-[0.1em] uppercase px-2 py-0.5 border border-sand text-stone">
                    {it.village_slugs.length} villages
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <Link
                    href={`/itineraries/${it.id}`}
                    className="font-inter text-[8px] tracking-[0.15em] uppercase text-deep-blue border-b border-deep-blue/40 pb-0.5 hover:border-deep-blue transition-colors"
                  >
                    Voir →
                  </Link>
                  <button
                    onClick={() => handleDelete(it.id)}
                    disabled={deleting === it.id}
                    className="font-inter text-[8px] tracking-[0.1em] uppercase text-stone/50 hover:text-red-500 transition-colors disabled:opacity-40"
                  >
                    {deleting === it.id ? 'Suppression…' : 'Supprimer'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ItinerariesPage() {
  return (
    <PageTransition>
      <ItinerariesContent />
    </PageTransition>
  )
}
