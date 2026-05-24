import { render, screen } from '@testing-library/react'
import { VillageCard } from './VillageCard'
import type { Village } from '@/types'

const mockVillage: Village = {
  slug: 'gordes',
  name: 'Gordes',
  region: 'Provence-Alpes-Côte d\'Azur',
  department: 'Vaucluse',
  lat: 43.9117,
  lng: 5.2011,
  description: 'A beautiful village.',
  tags: ['provence', 'medieval'],
  heroImage: 'https://example.com/gordes.jpg',
}

describe('VillageCard', () => {
  it('renders village name', () => {
    render(<VillageCard village={mockVillage} />)
    expect(screen.getByText('Gordes')).toBeInTheDocument()
  })

  it('renders region', () => {
    render(<VillageCard village={mockVillage} />)
    expect(screen.getByText('Provence-Alpes-Côte d\'Azur')).toBeInTheDocument()
  })

  it('shows visited badge when visitedAt provided', () => {
    render(<VillageCard village={mockVillage} visitedAt="2023-06-15" />)
    expect(screen.getByTitle('Visited')).toBeInTheDocument()
  })

  it('does not show visited badge when visitedAt absent', () => {
    render(<VillageCard village={mockVillage} />)
    expect(screen.queryByTitle('Visited')).not.toBeInTheDocument()
  })

  it('shows visited year in dept line', () => {
    render(<VillageCard village={mockVillage} visitedAt="2023-06-15" />)
    expect(screen.getByText(/Visited 2023/)).toBeInTheDocument()
  })

  it('links to the village page', () => {
    render(<VillageCard village={mockVillage} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/villages/gordes')
  })
})
