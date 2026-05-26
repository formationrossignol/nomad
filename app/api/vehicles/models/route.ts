import { NextRequest, NextResponse } from 'next/server'

const RESOURCE_ID = '669a1f00-299f-4c7c-9db2-cd32401e7b25'
const BASE = `https://tabular-api.data.gouv.fr/api/resources/${RESOURCE_ID}/data/`

export interface VehicleRecord {
  marque: string
  libelle_modele: string
  description_commerciale: string
  energie: string
  conso_mixte_min: number | null
  conso_mixte_max: number | null
  co2_mixte_min: number | null
  co2_mixte_max: number | null
  conso_elec_min: number | null
  conso_elec_max: number | null
  puissance_maximale: number | null
  type_de_boite: string | null
}

function mapRecord(r: Record<string, unknown>): VehicleRecord {
  return {
    marque: r['Marque'] as string,
    libelle_modele: r['Libellé modèle'] as string,
    description_commerciale: r['Description Commerciale'] as string,
    energie: r['Energie'] as string,
    conso_mixte_min: r['Conso vitesse mixte Min'] as number | null,
    conso_mixte_max: r['Conso vitesse mixte Max'] as number | null,
    co2_mixte_min: r['CO2 vitesse mixte Min'] as number | null,
    co2_mixte_max: r['CO2 vitesse mixte Max'] as number | null,
    conso_elec_min: r['Conso elec Min'] as number | null,
    conso_elec_max: r['Conso elec Max'] as number | null,
    puissance_maximale: r['Puissance maximale'] as number | null,
    type_de_boite: r['Type de boite'] as string | null,
  }
}

export async function GET(req: NextRequest) {
  const brand = req.nextUrl.searchParams.get('brand')?.trim().toUpperCase()
  if (!brand) return NextResponse.json([])

  const PAGE_SIZE = 100
  const all: VehicleRecord[] = []
  let page = 1

  while (true) {
    const url = `${BASE}?Marque__exact=${encodeURIComponent(brand)}&page_size=${PAGE_SIZE}&page=${page}`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) break

    const json = await res.json()
    const rows: VehicleRecord[] = (json.data ?? []).map(mapRecord)
    all.push(...rows)

    if (rows.length < PAGE_SIZE) break
    page++
    if (page > 10) break  // safety cap: max 1000 records
  }

  return NextResponse.json(all)
}
