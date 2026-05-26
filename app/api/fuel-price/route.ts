import { NextRequest, NextResponse } from 'next/server'
import { getFuelPrice, ENERGIE_TO_FUEL } from '@/lib/fuel-price'

export async function GET(req: NextRequest) {
  const fuelParam = req.nextUrl.searchParams.get('fuel')?.toLowerCase()
  if (!fuelParam) return NextResponse.json({ error: 'missing fuel param' }, { status: 400 })
  if (!ENERGIE_TO_FUEL[fuelParam]) return NextResponse.json({ error: 'unknown fuel type' }, { status: 400 })

  const result = await getFuelPrice(fuelParam)
  if (!result) return NextResponse.json({ error: 'no data' }, { status: 404 })

  return NextResponse.json({ ...result, fuel: fuelParam })
}
