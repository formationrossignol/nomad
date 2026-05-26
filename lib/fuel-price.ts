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

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

async function fetchPrices(col: string, dateFilter?: string): Promise<{ avg: number; count: number; date: string | null } | null> {
  const priceCol = `${col}_prix`
  const majCol = `${col}_maj`
  let where = `${priceCol} > 0`
  if (dateFilter) where += ` AND ${majCol} >= date'${dateFilter}'`

  const url = `${BASE}?select=${priceCol},${majCol}&where=${encodeURIComponent(where)}&limit=15000&order_by=${majCol}+desc`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) return null

  const json = await res.json()
  const rows: Array<Record<string, unknown>> = json.results ?? []
  const prices = rows.map(r => r[priceCol] as number).filter(p => p > 0)
  if (prices.length === 0) return null

  const avg = Math.round((prices.reduce((s, p) => s + p, 0) / prices.length) * 1000) / 1000
  const latestMaj = rows[0]?.[majCol] as string | undefined
  return { avg, count: prices.length, date: latestMaj ? latestMaj.slice(0, 10) : null }
}

export async function getFuelPrice(fuelParam: string): Promise<FuelPriceResult | null> {
  const col = ENERGIE_TO_FUEL[fuelParam]
  if (!col) return null

  const now = new Date()
  const today = isoDate(now)
  const yesterday = isoDate(new Date(now.getTime() - 86400000))

  const todayResult = await fetchPrices(col, today)
  if (todayResult && todayResult.count >= 50) {
    return { price: todayResult.avg, stationCount: todayResult.count, period: 'today', date: today, col }
  }

  const yResult = await fetchPrices(col, yesterday)
  if (yResult && yResult.count >= 20) {
    return { price: yResult.avg, stationCount: yResult.count, period: 'yesterday', date: yesterday, col }
  }

  const allResult = await fetchPrices(col)
  if (allResult) {
    return { price: allResult.avg, stationCount: allResult.count, period: 'latest', date: allResult.date, col }
  }

  return null
}

export function estimateFuelCost(totalDistanceKm: number, consoMixte: number, pricePerLiter: number): number {
  return Math.round(((totalDistanceKm / 100) * consoMixte * pricePerLiter) * 100) / 100
}
