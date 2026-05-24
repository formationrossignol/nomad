import { getAllVillages, getVillageBySlug, getVillagesByRegion, getNearbyVillages } from './villages'

describe('getAllVillages', () => {
  it('returns an array of villages', () => {
    const villages = getAllVillages()
    expect(Array.isArray(villages)).toBe(true)
    expect(villages.length).toBeGreaterThan(0)
  })

  it('each village has required fields', () => {
    const villages = getAllVillages()
    villages.forEach(v => {
      expect(v.slug).toBeDefined()
      expect(v.name).toBeDefined()
      expect(v.lat).toBeDefined()
      expect(v.lng).toBeDefined()
      expect(Array.isArray(v.tags)).toBe(true)
    })
  })
})

describe('getVillageBySlug', () => {
  it('returns the correct village', () => {
    const village = getVillageBySlug('gordes')
    expect(village?.name).toBe('Gordes')
  })

  it('returns undefined for unknown slug', () => {
    expect(getVillageBySlug('nonexistent')).toBeUndefined()
  })
})

describe('getVillagesByRegion', () => {
  it('filters by region', () => {
    const villages = getVillagesByRegion('Grand Est')
    expect(villages.every(v => v.region === 'Grand Est')).toBe(true)
  })
})

describe('getNearbyVillages', () => {
  it('returns villages sorted by proximity', () => {
    const gordes = getVillageBySlug('gordes')!
    const nearby = getNearbyVillages(gordes, 3)
    expect(nearby).toHaveLength(3)
    expect(nearby.every(v => v.slug !== 'gordes')).toBe(true)
  })

  it('excludes the source village', () => {
    const gordes = getVillageBySlug('gordes')!
    const nearby = getNearbyVillages(gordes, 5)
    expect(nearby.find(v => v.slug === 'gordes')).toBeUndefined()
  })
})
