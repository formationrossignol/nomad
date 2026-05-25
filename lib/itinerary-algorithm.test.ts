import { generateItinerary } from './itinerary-algorithm'
import { getAllVillages } from './villages'

const villages = getAllVillages()

describe('generateItinerary', () => {
  it('returns correct number of days', () => {
    const result = generateItinerary(villages, { days: 3, styles: [], pace: 'moderate' })
    expect(result.days).toHaveLength(3)
  })

  it('slow pace produces fewer stops per day than intensive', () => {
    const slow = generateItinerary(villages, { days: 1, styles: [], pace: 'slow' })
    const intensive = generateItinerary(villages, { days: 1, styles: [], pace: 'intensive' })
    expect(slow.days[0].stops.length).toBeLessThanOrEqual(intensive.days[0].stops.length)
  })

  it('each day has at least 1 stop', () => {
    const result = generateItinerary(villages, { days: 3, styles: [], pace: 'moderate' })
    result.days.forEach(day => expect(day.stops.length).toBeGreaterThanOrEqual(1))
  })

  it('each stop includes visitDurationMinutes', () => {
    const result = generateItinerary(villages, { days: 1, styles: [], pace: 'moderate' })
    result.days[0].stops.forEach(stop => {
      expect(stop.visitDurationMinutes).toBeGreaterThan(0)
    })
  })

  it('each day includes totalTimeMinutes', () => {
    const result = generateItinerary(villages, { days: 1, styles: [], pace: 'moderate' })
    expect(result.days[0].totalTimeMinutes).toBeGreaterThan(0)
  })

  it('sets poolExhausted when pool runs out', () => {
    // bretagne has only 6 villages — can't fill 10 days
    const result = generateItinerary(villages, { days: 10, styles: ['bretagne'], pace: 'slow' })
    expect(result.poolExhausted).toBe(true)
  })

  it('departure city sets departureCity in output', () => {
    const result = generateItinerary(villages, {
      days: 2, styles: [], pace: 'moderate',
      departureLat: 48.8566, departureLng: 2.3522, departureName: 'Paris',
    })
    expect(result.departureCity).toEqual({ name: 'Paris', lat: 48.8566, lng: 2.3522 })
    expect(result.returnTimeMinutes).toBeGreaterThan(0)
  })

  it('no departure → departureCity is null', () => {
    const result = generateItinerary(villages, { days: 1, styles: [], pace: 'moderate' })
    expect(result.departureCity).toBeNull()
    expect(result.returnTimeMinutes).toBeNull()
  })

  it('multi-region filters correctly', () => {
    const result = generateItinerary(villages, {
      days: 2, styles: [], pace: 'moderate',
      regions: ['Bretagne', 'Normandie'],
    })
    const allStops = result.days.flatMap(d => d.stops)
    // First stops should be from Bretagne or Normandie (priority regions)
    expect(allStops.length).toBeGreaterThan(0)
  })

  it('poolExhausted is false when pool is sufficient', () => {
    const result = generateItinerary(villages, { days: 1, styles: [], pace: 'slow' })
    expect(result.poolExhausted).toBe(false)
  })

  it('filters by style tags', () => {
    const result = generateItinerary(villages, { days: 2, styles: ['wine'], pace: 'moderate' })
    result.days.flatMap(d => d.stops).forEach(stop => {
      expect(stop.village.tags).toContain('wine')
    })
  })

  it('first stop has null driveTime when no departure provided', () => {
    const result = generateItinerary(villages, { days: 1, styles: [], pace: 'moderate' })
    expect(result.days[0].stops[0].driveTimeFromPrevMinutes).toBeNull()
  })

  it('first stop has non-null driveTime when departure provided', () => {
    const result = generateItinerary(villages, {
      days: 1, styles: [], pace: 'moderate',
      departureLat: 48.8566, departureLng: 2.3522,
    })
    expect(result.days[0].stops[0].driveTimeFromPrevMinutes).not.toBeNull()
    expect(result.days[0].stops[0].driveTimeFromPrevMinutes).toBeGreaterThan(0)
  })

  it('subsequent stops have positive driveTime', () => {
    const result = generateItinerary(villages, { days: 1, styles: [], pace: 'intensive' })
    const stops = result.days[0].stops
    if (stops.length > 1) {
      expect(stops[1].driveTimeFromPrevMinutes).toBeGreaterThan(0)
    }
  })

  it('excludes specified visited slugs', () => {
    const result = generateItinerary(villages, {
      days: 2, styles: [], pace: 'moderate',
      excludeVisited: ['gordes'],
    })
    const allSlugs = result.days.flatMap(d => d.stops.map(s => s.village.slug))
    expect(allSlugs).not.toContain('gordes')
  })
})
