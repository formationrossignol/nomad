import { haversineKm, driveTimeMinutes } from './haversine'

describe('haversineKm', () => {
  it('returns 0 for identical points', () => {
    expect(haversineKm(48.8566, 2.3522, 48.8566, 2.3522)).toBe(0)
  })

  it('calculates Paris→Lyon as approximately 392km', () => {
    const dist = haversineKm(48.8566, 2.3522, 45.7640, 4.8357)
    expect(dist).toBeGreaterThan(380)
    expect(dist).toBeLessThan(405)
  })

  it('calculates Gordes→Les Baux as approximately 37km', () => {
    const dist = haversineKm(43.9117, 5.2011, 43.7443, 4.7948)
    expect(dist).toBeGreaterThan(30)
    expect(dist).toBeLessThan(45)
  })
})

describe('driveTimeMinutes', () => {
  it('calculates 60km at 60km/h as 60 minutes', () => {
    expect(driveTimeMinutes(60)).toBe(60)
  })

  it('calculates 30km at 60km/h as 30 minutes', () => {
    expect(driveTimeMinutes(30)).toBe(30)
  })

  it('rounds to nearest minute', () => {
    expect(driveTimeMinutes(10)).toBe(10)
  })
})
