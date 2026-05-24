'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageTransition } from '@/components/layout/PageTransition'
import { EditorialField, editorialInputClass } from '@/components/forms/EditorialForm'
import { supabase } from '@/lib/supabase/client'

export default function NewJourneyPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [year, setYear] = useState<string>(String(new Date().getFullYear()))
  const [destination, setDestination] = useState('')
  const [heroFile, setHeroFile] = useState<File | null>(null)
  const [heroPreview, setHeroPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setHeroFile(file)
    setHeroPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)

    let hero_image_url: string | null = null

    if (heroFile) {
      const ext = heroFile.name.split('.').pop()
      const path = `${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('journey-heroes')
        .upload(path, heroFile)
      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('journey-heroes')
          .getPublicUrl(path)
        hero_image_url = urlData.publicUrl
      }
    }

    const { data, error } = await supabase
      .from('journeys')
      .insert({
        title: title.trim(),
        year: year ? parseInt(year, 10) : null,
        destination: destination.trim() || null,
        hero_image_url,
      })
      .select()
      .single()

    if (!error && data) {
      router.push(`/journeys/${data.id}`)
    } else {
      setSaving(false)
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-ivory pt-[52px]">
        <div className="max-w-2xl mx-auto px-8 py-16">
          <p className="font-inter text-[9px] tracking-[0.25em] uppercase text-stone mb-6">
            New journey
          </p>
          <h1 className="font-cormorant italic text-[40px] text-deep-blue mb-12">
            Open a new chapter
          </h1>

          <form onSubmit={handleSubmit}>
            <EditorialField label="Journey title">
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Provence, Summer 2024"
                className={editorialInputClass}
                required
                autoFocus
              />
            </EditorialField>

            <EditorialField label="Year">
              <input
                type="number"
                value={year}
                onChange={e => setYear(e.target.value)}
                placeholder="2024"
                min="1900"
                max="2099"
                className={editorialInputClass}
              />
            </EditorialField>

            <EditorialField label="Destination">
              <input
                type="text"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                placeholder="France · Provence"
                className={editorialInputClass}
              />
            </EditorialField>

            <EditorialField label="Hero photograph">
              {heroPreview ? (
                <div className="relative">
                  <img src={heroPreview} alt="Preview" className="w-full h-48 object-cover" />
                  <button
                    type="button"
                    onClick={() => { setHeroFile(null); setHeroPreview(null) }}
                    className="absolute top-2 right-2 font-inter text-[8px] tracking-[0.1em] uppercase bg-midnight/70 text-ivory px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center h-32 border border-dashed border-sand cursor-pointer hover:border-deep-blue transition-colors duration-200">
                  <span className="font-inter text-[9px] tracking-[0.15em] uppercase text-stone">
                    Upload photo
                  </span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
                </label>
              )}
            </EditorialField>

            <div className="pt-8">
              <button
                type="submit"
                disabled={saving || !title.trim()}
                className="font-inter text-[10px] tracking-[0.18em] uppercase px-8 py-3 bg-deep-blue text-ivory hover:bg-cobalt disabled:opacity-40 transition-colors duration-200"
              >
                {saving ? 'Creating…' : 'Begin Journey'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageTransition>
  )
}
