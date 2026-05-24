import { render, screen } from '@testing-library/react'
import { JourneyCard } from './JourneyCard'
import type { Journey } from '@/types'

const mockJourney: Journey = {
  id: 'abc-123',
  title: 'Provence Summer',
  year: 2023,
  destination: 'Provence',
  hero_image_url: 'https://example.com/hero.jpg',
  notes: null,
  created_at: '2023-07-01T00:00:00Z',
}

describe('JourneyCard', () => {
  it('renders journey title', () => {
    render(<JourneyCard journey={mockJourney} />)
    expect(screen.getByText('Provence Summer')).toBeInTheDocument()
  })

  it('renders year badge', () => {
    render(<JourneyCard journey={mockJourney} />)
    expect(screen.getByText('2023')).toBeInTheDocument()
  })

  it('links to journey detail', () => {
    render(<JourneyCard journey={mockJourney} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/journeys/abc-123')
  })
})
