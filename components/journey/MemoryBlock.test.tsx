import { render, screen } from '@testing-library/react'
import { MemoryBlock } from './MemoryBlock'
import type { Memory } from '@/types'

const mockMemory: Memory = {
  id: 'm-1',
  journey_id: 'j-1',
  title: 'Sunset at Gordes',
  body: 'The light turned everything gold.',
  location_name: 'Gordes',
  lat: 43.9117,
  lng: 5.2011,
  created_at: '2023-07-15T18:30:00Z',
  memory_photos: [],
}

describe('MemoryBlock', () => {
  it('renders memory title', () => {
    render(<MemoryBlock memory={mockMemory} />)
    expect(screen.getByText('Sunset at Gordes')).toBeInTheDocument()
  })

  it('renders memory body', () => {
    render(<MemoryBlock memory={mockMemory} />)
    expect(screen.getByText('The light turned everything gold.')).toBeInTheDocument()
  })

  it('renders location name', () => {
    render(<MemoryBlock memory={mockMemory} />)
    expect(screen.getByText('Gordes')).toBeInTheDocument()
  })
})
