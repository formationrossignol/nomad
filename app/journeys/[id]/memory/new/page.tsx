'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { PageTransition } from '@/components/layout/PageTransition'
import { EditorialField, editorialInputClass, editorialTextareaClass } from '@/components/forms/EditorialForm'
import { ShimmerLoader } from '@/components/layout/ShimmerLoader'
import { supabase } from '@/lib/supabase/client'

const LocationPicker = dynamic(() => import('@/components/forms/LocationPicker'), {
  ssr: false,
  loading: () => <ShimmerLoader className="h-48 w-full" />,
})

interface Props {
  params: { id: string }
}

export default function NewMemoryPage({ params }: Props) {
  const { id: journeyId } = params
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [locationName, setLocationName] = useState('')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    setPhotos(prev => [...prev, ...files])
    setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const { data: memory, error } = await supabase
      .from('memories')
      .insert({
        journey_id: journeyId,
        title: title.trim() || null,
        body: body.trim() || null,
        location_name: locationName.trim() || null,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
      })
      .select()
      .single()

    if (error || !memory) { setSaving(false); return }

    // Upload photos sequentially
    for (let i = 0; i < photos.length; i++) {
      const file = photos[i]
      const ext = file.name.split('.').pop()
      const path = `${memory.id}-${i}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('memory-photos')
        .upload(path, file)
      if (!upErr) {
        const { data: urlData } = supabase.storage.from('memory-photos').getPublicUrl(path)
        await supabase.from('memory_photos').insert({
          memory_id: memory.id,
          storage_url: urlData.publicUrl,
          sort_order: i,
        })
      }
    }

    router.push(`/journeys/${journeyId}`)
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-ivory pt-[52px]">
        <div className="max-w-2xl mx-auto px-8 py-16">
          <p className="font-inter text-[9px] tracking-[0.25em] uppercase text-stone mb-6">
            Nouveau souvenir
          </p>
          <h1 className="font-cormorant italic text-[36px] text-deep-blue mb-12">
            Capturer l&apos;instant
          </h1>

          <form onSubmit={handleSubmit}>
            <EditorialField label="Titre (optionnel)">
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Coucher de soleil sur les remparts"
                className={editorialInputClass}
              />
            </EditorialField>

            <EditorialField label="Notes">
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Qu'avez-vous ressenti…"
                rows={5}
                className={editorialTextareaClass}
              />
            </EditorialField>

            <EditorialField label="Lieu">
              <input
                type="text"
                value={locationName}
                onChange={e => setLocationName(e.target.value)}
                placeholder="Nom du village ou du lieu"
                className={`${editorialInputClass} mb-4`}
              />
              <p className="font-inter text-[8px] tracking-[0.1em] uppercase text-stone mb-2">
                Épingler sur la carte (optionnel)
              </p>
              <LocationPicker value={coords} onChange={setCoords} />
            </EditorialField>

            <EditorialField label="Photographies">
              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {previews.map((src, i) => (
                    <img key={i} src={src} alt="" className="w-full h-24 object-cover" />
                  ))}
                </div>
              )}
              <label className="flex items-center justify-center h-16 border border-dashed border-sand cursor-pointer hover:border-deep-blue transition-colors duration-200">
                <span className="font-inter text-[9px] tracking-[0.15em] uppercase text-stone">
                  Ajouter des photos
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="sr-only"
                />
              </label>
            </EditorialField>

            <div className="pt-8">
              <button
                type="submit"
                disabled={saving}
                className="font-inter text-[10px] tracking-[0.18em] uppercase px-8 py-3 bg-deep-blue text-ivory hover:bg-cobalt disabled:opacity-40 transition-colors duration-200"
              >
                {saving ? 'Enregistrement…' : 'Enregistrer le souvenir'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageTransition>
  )
}
