'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageTransition } from '@/components/layout/PageTransition'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { useAuth } from '@/hooks/useAuth'
import { useVehicle } from '@/hooks/useVehicle'
import { ENERGIE_TO_FUEL } from '@/lib/fuel-price'
import type { FuelPriceResult } from '@/lib/fuel-price'

interface VehicleRecord {
  marque: string
  libelle_modele: string
  description_commerciale: string | null
  energie: string
  conso_mixte: number | null
}

function FuelPriceWidget({ energie }: { energie: string }) {
  const fuelParam = ENERGIE_TO_FUEL[energie]
  const [result, setResult] = useState<FuelPriceResult | null>(null)

  useEffect(() => {
    if (!fuelParam) return
    fetch(`/api/fuel-price?fuel=${fuelParam}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setResult(d))
      .catch(() => {})
  }, [fuelParam])

  if (!fuelParam || !result) return null

  return (
    <div className="mt-6 pt-6 border-t border-sand/40">
      <p className="font-inter text-[7.5px] tracking-[0.15em] uppercase text-stone mb-1">
        Prix moyen du carburant
      </p>
      <p className="font-cormorant italic text-[32px] text-deep-blue leading-none">
        {result.price.toFixed(3)} €/L
      </p>
      <p className="font-inter text-[7px] tracking-[0.08em] text-stone/50 mt-1">
        {result.period === 'today' ? "Aujourd'hui" : result.period === 'yesterday' ? 'Hier' : 'Dernières données disponibles'}
        {' · '}{result.stationCount} stations
      </p>
      <p className="font-inter text-[6.5px] tracking-[0.05em] text-stone/30 mt-1">
        Source : data.economie.gouv.fr
      </p>
    </div>
  )
}

function SavedVehicleCard({ vehicle, onDelete }: { vehicle: ReturnType<typeof useVehicle>['vehicle'] & object; onDelete: () => void }) {
  if (!vehicle) return null
  return (
    <div className="border border-sand/60 p-6 bg-white mb-8">
      <p className="font-inter text-[7.5px] tracking-[0.15em] uppercase text-stone mb-2">Véhicule enregistré</p>
      <p className="font-cormorant italic text-[22px] text-deep-blue leading-tight mb-4">
        {vehicle.description_commerciale ?? `${vehicle.marque} ${vehicle.libelle_modele}`}
      </p>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="font-inter text-[7px] tracking-[0.12em] uppercase text-stone/50 mb-0.5">Marque</p>
          <p className="font-inter text-[11px] text-deep-blue">{vehicle.marque}</p>
        </div>
        <div>
          <p className="font-inter text-[7px] tracking-[0.12em] uppercase text-stone/50 mb-0.5">Énergie</p>
          <p className="font-inter text-[11px] text-deep-blue">{vehicle.energie}</p>
        </div>
        {vehicle.conso_mixte !== null && (
          <div>
            <p className="font-inter text-[7px] tracking-[0.12em] uppercase text-stone/50 mb-0.5">Conso. mixte</p>
            <p className="font-inter text-[11px] text-deep-blue">{vehicle.conso_mixte} L/100km</p>
          </div>
        )}
      </div>
      <FuelPriceWidget energie={vehicle.energie} />
      <button
        onClick={onDelete}
        className="mt-4 font-inter text-[7.5px] tracking-[0.1em] uppercase text-stone/40 hover:text-red-400 transition-colors"
      >
        Supprimer le véhicule
      </button>
    </div>
  )
}

function VehicleSearch() {
  const { vehicle, saveVehicle, deleteVehicle } = useVehicle()
  const [brandQuery, setBrandQuery] = useState('')
  const [brands, setBrands] = useState<string[]>([])
  const [selectedBrand, setSelectedBrand] = useState('')
  const [models, setModels] = useState<VehicleRecord[]>([])
  const [selectedModel, setSelectedModel] = useState<VehicleRecord | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (brandQuery.length < 2) { setBrands([]); return }
    const t = setTimeout(() => {
      fetch(`/api/vehicles/brands?q=${encodeURIComponent(brandQuery)}`)
        .then(r => r.ok ? r.json() : { brands: [] })
        .then(d => setBrands(d.brands ?? []))
        .catch(() => {})
    }, 300)
    return () => clearTimeout(t)
  }, [brandQuery])

  useEffect(() => {
    if (!selectedBrand) { setModels([]); return }
    fetch(`/api/vehicles/models?brand=${encodeURIComponent(selectedBrand)}`)
      .then(r => r.ok ? r.json() : { models: [] })
      .then(d => setModels(d.models ?? []))
      .catch(() => {})
  }, [selectedBrand])

  async function handleSave() {
    if (!selectedModel) return
    setSaving(true)
    await saveVehicle({
      marque: selectedModel.marque,
      libelle_modele: selectedModel.libelle_modele,
      description_commerciale: selectedModel.description_commerciale,
      energie: selectedModel.energie,
      conso_mixte: selectedModel.conso_mixte,
    })
    setSaving(false)
    setBrandQuery('')
    setSelectedBrand('')
    setModels([])
    setSelectedModel(null)
  }

  const groupedModels = models.reduce<Record<string, VehicleRecord[]>>((acc, m) => {
    const key = m.energie
    if (!acc[key]) acc[key] = []
    acc[key].push(m)
    return acc
  }, {})

  if (vehicle) {
    return <SavedVehicleCard vehicle={vehicle} onDelete={deleteVehicle} />
  }

  return (
    <div className="mb-8">
      <p className="font-inter text-[8px] tracking-[0.2em] uppercase text-stone block mb-6">
        Enregistrer votre véhicule
      </p>

      {/* Brand search */}
      <div className="mb-6">
        <label className="font-inter text-[7.5px] tracking-[0.15em] uppercase text-stone block mb-2">
          Marque
        </label>
        <input
          type="text"
          value={brandQuery}
          onChange={e => { setBrandQuery(e.target.value); setSelectedBrand(''); setSelectedModel(null) }}
          placeholder="Ex: Renault, Peugeot, Toyota…"
          className="w-full bg-transparent border-b border-sand font-cormorant italic text-[16px] text-deep-blue pb-1 focus:outline-none focus:border-deep-blue placeholder:text-stone/40"
        />
        {brands.length > 0 && !selectedBrand && (
          <div className="border border-sand mt-1 bg-white max-h-40 overflow-y-auto">
            {brands.map(b => (
              <button
                key={b}
                type="button"
                onClick={() => { setSelectedBrand(b); setBrandQuery(b); setBrands([]) }}
                className="w-full text-left px-3 py-2 font-inter text-[11px] text-deep-blue hover:bg-sand/30 transition-colors"
              >
                {b}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Model select */}
      {selectedBrand && models.length > 0 && (
        <div className="mb-6">
          <label className="font-inter text-[7.5px] tracking-[0.15em] uppercase text-stone block mb-2">
            Modèle
          </label>
          <select
            value={selectedModel ? JSON.stringify(selectedModel) : ''}
            onChange={e => setSelectedModel(e.target.value ? JSON.parse(e.target.value) : null)}
            className="w-full bg-transparent border-b border-sand font-cormorant italic text-[16px] text-deep-blue pb-1 focus:outline-none focus:border-deep-blue"
          >
            <option value="">Choisir un modèle…</option>
            {Object.entries(groupedModels).map(([energie, ms]) => (
              <optgroup key={energie} label={energie}>
                {ms.map((m, i) => (
                  <option key={i} value={JSON.stringify(m)}>
                    {m.description_commerciale ?? m.libelle_modele}
                    {m.conso_mixte !== null ? ` — ${m.conso_mixte} L/100km` : ''}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      )}

      {selectedModel && (
        <div className="mb-6 p-4 border border-sand/60 bg-white">
          <p className="font-inter text-[7px] tracking-[0.1em] uppercase text-stone/50 mb-1">Sélectionné</p>
          <p className="font-cormorant italic text-[16px] text-deep-blue">
            {selectedModel.description_commerciale ?? selectedModel.libelle_modele}
          </p>
          {selectedModel.conso_mixte !== null && (
            <p className="font-inter text-[10px] text-stone mt-1">{selectedModel.conso_mixte} L/100km · {selectedModel.energie}</p>
          )}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={!selectedModel || saving}
        className="font-inter text-[9px] tracking-[0.18em] uppercase px-6 py-3 bg-deep-blue text-ivory hover:bg-cobalt disabled:opacity-40 transition-colors duration-200"
      >
        {saving ? 'Sauvegarde…' : 'Enregistrer ce véhicule'}
      </button>
    </div>
  )
}

function AccountContent() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  async function handleSignOut() {
    try {
      await signOut()
    } finally {
      router.push('/')
    }
  }

  const initials = (user?.email ?? '').slice(0, 2).toUpperCase() || '??'

  return (
    <section className="bg-ivory min-h-screen py-20 px-12 max-w-2xl">
      <p className="font-inter text-[9px] tracking-[0.28em] uppercase text-deep-blue/40 mb-3">
        Mon compte
      </p>
      <h1 className="font-cormorant italic text-[38px] text-deep-blue leading-tight mb-3">
        Profil
      </h1>
      <div className="w-8 h-px bg-champagne mb-10" />

      <div className="flex items-center gap-6 mb-12">
        <div className="w-16 h-16 rounded-full bg-deep-blue flex items-center justify-center">
          <span className="font-cormorant italic text-[22px] text-ivory">{initials}</span>
        </div>
        <div>
          <p className="font-inter text-[13px] text-deep-blue">{user?.email}</p>
          <p className="font-inter text-[10px] text-deep-blue/40 tracking-widest uppercase mt-1">
            Membre
          </p>
        </div>
      </div>

      <div className="w-full h-px bg-sand/60 mb-10" />

      <VehicleSearch />

      <div className="w-full h-px bg-sand/60 mb-10" />

      <button
        onClick={handleSignOut}
        className="font-inter text-[9px] tracking-[0.2em] uppercase border border-deep-blue/30 text-deep-blue px-6 py-2 hover:bg-deep-blue hover:text-ivory transition-colors"
      >
        Déconnexion
      </button>
    </section>
  )
}

export default function AccountPage() {
  return (
    <PageTransition>
      <AuthGuard>
        <AccountContent />
      </AuthGuard>
    </PageTransition>
  )
}
