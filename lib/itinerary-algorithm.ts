import type { Village, ItineraryInput, GeneratedItinerary, ItineraryDay, ItineraryStop, DepartureCity } from '@/types'
import { haversineKm, driveTimeMinutes } from './haversine'

const DAY_BUDGET_MINUTES = { slow: 360, moderate: 480, intensive: 600 } as const

const ATMOSPHERE_NOTES: Record<string, string> = {
  wine: 'Follow the wine routes through sun-drenched hillside vineyards',
  gastronomy: 'A day of markets, farm tables, and regional delicacies',
  coastal: 'The sea light changes every hour along these cliffs',
  medieval: 'Time moves differently among these ancient stones',
  photography: 'Golden hour arrives early — keep your camera ready',
  hidden: 'These villages reward those who stray from the main roads',
  architectural: 'Every stone here was placed with intention and care',
  default: 'A slow day through France\'s quietest and most beautiful places',
}

function getAtmosphereNote(styles: string[]): string {
  const matched = styles.find(s => ATMOSPHERE_NOTES[s])
  return matched ? ATMOSPHERE_NOTES[matched] : ATMOSPHERE_NOTES.default
}

export function generateItinerary(villages: Village[], input: ItineraryInput): GeneratedItinerary {
  const { days, regions, styles, pace, excludeVisited = [], departureLat, departureLng, departureName } = input

  let pool = villages.filter(v => !excludeVisited.includes(v.slug))

  if (styles.length > 0) {
    pool = pool.filter(v => v.tags.some(t => styles.includes(t)))
  }

  if (regions && regions.length > 0) {
    const regionVillages = pool.filter(v => regions.includes(v.region))
    const others = pool.filter(v => !regions.includes(v.region))
    if (regionVillages.length > 0) {
      const centerLat = regionVillages.reduce((s, v) => s + v.lat, 0) / regionVillages.length
      const centerLng = regionVillages.reduce((s, v) => s + v.lng, 0) / regionVillages.length
      pool = [
        ...regionVillages,
        ...others.sort((a, b) =>
          haversineKm(a.lat, a.lng, centerLat, centerLng) -
          haversineKm(b.lat, b.lng, centerLat, centerLng)
        ),
      ]
    }
  }

  const budget = DAY_BUDGET_MINUTES[pace]
  const selected: Village[] = []
  const remaining = [...pool]

  if (remaining.length > 0) {
    if (departureLat !== undefined && departureLng !== undefined) {
      let nearestIdx = 0
      let nearestDist = Infinity
      remaining.forEach((v, i) => {
        const d = haversineKm(departureLat, departureLng, v.lat, v.lng)
        if (d < nearestDist) { nearestDist = d; nearestIdx = i }
      })
      selected.push(remaining.splice(nearestIdx, 1)[0])
    } else {
      selected.push(remaining.splice(0, 1)[0])
    }

    while (selected.length < Math.max(days * 5, 30) && remaining.length > 0) {
      const last = selected[selected.length - 1]
      let nearestIdx = 0
      let nearestDist = Infinity
      remaining.forEach((v, i) => {
        const d = haversineKm(last.lat, last.lng, v.lat, v.lng)
        if (d < nearestDist) { nearestDist = d; nearestIdx = i }
      })
      selected.push(remaining.splice(nearestIdx, 1)[0])
    }
  }

  const atmosphereNote = getAtmosphereNote(styles)
  const itineraryDays: ItineraryDay[] = []
  let villageIdx = 0

  for (let d = 0; d < days && villageIdx < selected.length; d++) {
    const dayVillages: Village[] = []
    let usedMinutes = 0
    let prevVillage: Village | null = d === 0 ? null : selected[villageIdx - 1] ?? null

    while (villageIdx < selected.length) {
      const v = selected[villageIdx]
      const driveToV = prevVillage
        ? driveTimeMinutes(haversineKm(prevVillage.lat, prevVillage.lng, v.lat, v.lng))
        : (departureLat !== undefined && departureLng !== undefined
            ? driveTimeMinutes(haversineKm(departureLat, departureLng, v.lat, v.lng))
            : 0)

      const cost = driveToV + v.visitDurationMinutes

      if (dayVillages.length > 0 && usedMinutes + cost > budget) break

      dayVillages.push(v)
      usedMinutes += cost
      prevVillage = v
      villageIdx++

      if (dayVillages.length >= 1 && usedMinutes >= budget * 0.8) break
    }

    if (dayVillages.length === 0) break

    const stops: ItineraryStop[] = dayVillages.map((v, i) => {
      const prev = i === 0
        ? (d === 0
            ? (departureLat !== undefined && departureLng !== undefined ? { lat: departureLat, lng: departureLng } : null)
            : selected[villageIdx - dayVillages.length - 1] ?? null)
        : dayVillages[i - 1]

      const driveTimeFromPrevMinutes = prev
        ? driveTimeMinutes(haversineKm(prev.lat, prev.lng, v.lat, v.lng))
        : null

      return { village: v, driveTimeFromPrevMinutes, visitDurationMinutes: v.visitDurationMinutes }
    })

    const totalTimeMinutes = stops.reduce((sum, s) => {
      return sum + s.visitDurationMinutes + (s.driveTimeFromPrevMinutes ?? 0)
    }, 0)

    itineraryDays.push({
      dayNumber: d + 1,
      label: `Jour ${d + 1}`,
      atmosphereNote,
      stops,
      totalTimeMinutes,
    })
  }

  const departureCity: DepartureCity | null =
    departureLat !== undefined && departureLng !== undefined && departureName
      ? { name: departureName, lat: departureLat, lng: departureLng }
      : null

  // Return drive time from last stop to departure city
  let returnTimeMinutes: number | null = null
  let returnDistanceKm = 0
  if (departureCity && itineraryDays.length > 0) {
    const lastDay = itineraryDays[itineraryDays.length - 1]
    const lastStop = lastDay.stops[lastDay.stops.length - 1]
    const returnKm = haversineKm(lastStop.village.lat, lastStop.village.lng, departureCity.lat, departureCity.lng)
    returnTimeMinutes = driveTimeMinutes(returnKm)
    returnDistanceKm = returnKm
  }

  // driveTimeMinutes at 60 km/h → minutes ≈ km numerically
  const totalDistanceKm = Math.round(
    itineraryDays.reduce((sum, d) =>
      sum + d.stops.reduce((s, stop) => s + (stop.driveTimeFromPrevMinutes ?? 0), 0), 0
    ) + returnDistanceKm
  )

  return {
    days: itineraryDays,
    totalVillages: itineraryDays.reduce((s, d) => s + d.stops.length, 0),
    totalDistanceKm,
    poolExhausted: villageIdx >= selected.length && itineraryDays.length < days,
    departureCity,
    returnTimeMinutes,
  }
}
