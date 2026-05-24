import type { Village, ItineraryInput, GeneratedItinerary, ItineraryDay, ItineraryStop } from '@/types'
import { haversineKm, driveTimeMinutes } from './haversine'

const VILLAGES_PER_DAY = { slow: 2, moderate: 3, intensive: 4 } as const

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
  const { days, region, styles, pace, excludeVisited = [] } = input

  let pool = villages.filter(v => !excludeVisited.includes(v.slug))

  if (styles.length > 0) {
    pool = pool.filter(v => v.tags.some(t => styles.includes(t)))
  }

  if (region) {
    const regionVillages = pool.filter(v => v.region === region)
    const others = pool.filter(v => v.region !== region)
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

  const vpd = VILLAGES_PER_DAY[pace]
  const totalNeeded = days * vpd
  const selected: Village[] = []
  const remaining = [...pool]

  if (remaining.length > 0) {
    selected.push(remaining.splice(0, 1)[0])
    while (selected.length < totalNeeded && remaining.length > 0) {
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

  for (let d = 0; d < days; d++) {
    const dayVillages = selected.slice(d * vpd, (d + 1) * vpd)
    if (dayVillages.length === 0) break

    const stops: ItineraryStop[] = dayVillages.map((v, i) => {
      const prevVillage = i === 0
        ? (d === 0 ? null : selected[d * vpd - 1])
        : dayVillages[i - 1]

      const driveTimeFromPrevMinutes = prevVillage
        ? driveTimeMinutes(haversineKm(prevVillage.lat, prevVillage.lng, v.lat, v.lng))
        : null

      return { village: v, driveTimeFromPrevMinutes }
    })

    itineraryDays.push({
      dayNumber: d + 1,
      label: `Day ${d + 1}`,
      atmosphereNote,
      stops,
    })
  }

  return {
    days: itineraryDays,
    totalVillages: selected.length,
    poolExhausted: selected.length < totalNeeded,
  }
}
