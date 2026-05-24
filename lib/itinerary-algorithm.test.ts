import { generateItinerary } from './itinerary-algorithm'
import { getAllVillages } from './villages'

const villages = getAllVillages()

describe('generateItinerary', () => {
  it('returns correct number of days', () => {
    const result = generateItinerary(villages, { days: 3, styles: [], pace: 'moderate' })
    expect(result.days).toHaveLength(3)
  })

  it('respects pace: slow=2 villages/day', () => {
    const result = generateItinerary(villages, { days: 2, styles: [], pace: 'slow' })
    result.days.forEach(day => expect(day.stops.length).toBe(2))
  })

  it('respects pace: moderate=3 villages/day', () => {
    const result = generateItinerary(villages, { days: 2, styles: [], pace: 'moderate' })
    result.days.forEach(day => expect(day.stops.length).toBe(3))
  })

  it('respects pace: intensive=4 villages/day', () => {
    const result = generateItinerary(villages, { days: 1, styles: [], pace: 'intensive' })
    result.days.forEach(day => expect(day.stops.length).toBe(4))
  })

  it('sets poolExhausted when pool runs out before totalNeeded', () => {
    const result = generateItinerary(villages, { days: 3, styles: ['wine'], pace: 'intensive' })
    expect(result.poolExhausted).toBe(true)
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

  it('first stop has null driveTime', () => {
    const result = generateItinerary(villages, { days: 1, styles: [], pace: 'moderate' })
    expect(result.days[0].stops[0].driveTimeFromPrevMinutes).toBeNull()
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
