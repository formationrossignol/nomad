import { NextRequest, NextResponse } from 'next/server'

const RESOURCE_ID = '669a1f00-299f-4c7c-9db2-cd32401e7b25'
const BASE = `https://tabular-api.data.gouv.fr/api/resources/${RESOURCE_ID}/data/`

export interface VehicleRecord {
  marque: string
  libelle_modele: string
  description_commerciale: string | null
  energie: string
  conso_mixte: number | null
}

function mapRecord(r: Record<string, unknown>): VehicleRecord {
  const min = r['Conso vitesse mixte Min'] as number | null
  const max = r['Conso vitesse mixte Max'] as number | null
  const conso_mixte = min !== null && max !== null
    ? Math.round(((min + max) / 2) * 10) / 10
    : (min ?? max ?? null)
  return {
    marque: r['Marque'] as string,
    libelle_modele: r['Libellé modèle'] as string,
    description_commerciale: (r['Description Commerciale'] as string) || null,
    energie: r['Energie'] as string,
    conso_mixte,
  }
}

export async function GET(req: NextRequest) {
  const brand = req.nextUrl.searchParams.get('brand')?.trim().toUpperCase()
  if (!brand) return NextResponse.json({ models: [] })

  const PAGE_SIZE = 100
  const all: VehicleRecord[] = []
  let page = 1

  while (true) {
    const url = `${BASE}?Marque__exact=${encodeURIComponent(brand)}&page_size=${PAGE_SIZE}&page=${page}`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) break

    const json = await res.json()
    const rows: VehicleRecord[] = (json.data ?? []).map(mapRecord)
    all.push(...rows)

    if (rows.length < PAGE_SIZE) break
    page++
    if (page > 10) break  // safety cap: max 1000 records
  }

  return NextResponse.json({ models: all })
}
