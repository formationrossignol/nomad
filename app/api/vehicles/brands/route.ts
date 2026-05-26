import { NextRequest, NextResponse } from 'next/server'

const RESOURCE_ID = '669a1f00-299f-4c7c-9db2-cd32401e7b25'
const BASE = `https://tabular-api.data.gouv.fr/api/resources/${RESOURCE_ID}/data/`

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim().toUpperCase()
  if (!q || q.length < 2) return NextResponse.json({ brands: [] })

  const url = `${BASE}?Marque__contains=${encodeURIComponent(q)}&page_size=200`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) return NextResponse.json({ brands: [], error: `upstream ${res.status}` }, { status: 502 })

  const json = await res.json()
  const brands: string[] = Array.from(
    new Set((json.data ?? []).map((r: Record<string, unknown>) => r['Marque'] as string))
  ).sort() as string[]

  return NextResponse.json({ brands })
}
