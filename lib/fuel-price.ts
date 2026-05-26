const BASE = 'https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records'

export const ENERGIE_TO_FUEL: Record<string, string> = {
  'ESSENCE':                       'sp95',
  'DIESEL':                        'gazole',
  'HYBRIDE RECHARGEABLE ESSENCE':  'sp95',
  'HYBRIDE RECHARGEABLE DIESEL':   'gazole',
  'GPL':                           'gplc',
  'ETHANOL':                       'e85',
  'E10':                           'e10',
  'SP98':                          'sp98',
  // also handle lowercase/param aliases
  'essence': 'sp95',
  'diesel':  'gazole',
  'gpl':     'gplc',
  'gplc':    'gplc',
  'ethanol': 'e85',
  'e10':     'e10',
  'e85':     'e85',
  'sp95':    'sp95',
  'sp98':    'sp98',
}

export interface FuelPriceResult {
  price: number
  stationCount: number
  period: 'today' | 'yesterday' | 'latest'
  date: string | null
  col: string
}

function dayStart(d: Date): string {
  return `${d.toISOString().slice(0, 10)}T00:00:00Z`
}

async function fetchAvg(col: string, since: string, before?: string): Promise<{ avg: number; count: number } | null> {
  let where = `${col}_prix > 0 and ${col}_maj > "${since}"`
  if (before) where += ` and ${col}_maj < "${before}"`

  const url = `${BASE}?select=${col}_prix,${col}_maj&where=${encodeURIComponent(where)}&limit=15000`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) return null

  const json = await res.json()
  const prices: number[] = (json.results ?? [])
    .map((r: Record<string, unknown>) => r[`${col}_prix`] as number)
    .filter((p: number) => p > 0)

  if (prices.length === 0) return null
  const avg = Math.round((prices.reduce((s, p) => s + p, 0) / prices.length) * 1000) / 1000
  return { avg, count: prices.length }
}

export async function getFuelPrice(fuelParam: string): Promise<FuelPriceResult | null> {
  const col = ENERGIE_TO_FUEL[fuelParam]
  if (!col) return null

  const now = new Date()
  const todayStart = dayStart(now)
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStart = dayStart(yesterday)

  const todayResult = await fetchAvg(col, todayStart)
  if (todayResult && todayResult.count >= 100) {
    return { price: todayResult.avg, stationCount: todayResult.count, period: 'today', date: now.toISOString().slice(0, 10), col }
  }

  const yResult = await fetchAvg(col, yesterdayStart, todayStart)
  if (yResult && yResult.count >= 50) {
    return { price: yResult.avg, stationCount: yResult.count, period: 'yesterday', date: yesterday.toISOString().slice(0, 10), col }
  }

  const allResult = await fetchAvg(col, '2020-01-01T00:00:00Z')
  if (allResult) {
    return { price: allResult.avg, stationCount: allResult.count, period: 'latest', date: null, col }
  }

  return null
}

export function estimateFuelCost(totalDistanceKm: number, consoMixte: number, pricePerLiter: number): number {
  return Math.round(((totalDistanceKm / 100) * consoMixte * pricePerLiter) * 100) / 100
}
