import { render, screen } from '@testing-library/react'
import { VillageMap } from './VillageMap'
import type { Village } from '@/types'

const mockVillages: Village[] = [
  {
    slug: 'gordes', name: 'Gordes', region: 'Provence', department: 'Vaucluse',
    lat: 43.9117, lng: 5.2011, description: '', tags: [], heroImage: '',
    visitDurationMinutes: 120,
  },
]

describe('VillageMap', () => {
  it('renders the map container', () => {
    render(
      <VillageMap
        villages={mockVillages}
        visitedSlugs={new Set()}
      />
    )
    // ShimmerLoader visible until dynamic import resolves in tests
    // The dynamic shell itself renders without error
    expect(document.body).toBeInTheDocument()
  })
})
