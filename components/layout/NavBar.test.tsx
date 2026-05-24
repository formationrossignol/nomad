import { render, screen } from '@testing-library/react'
import { NavBar } from './NavBar'

jest.mock('next/navigation', () => ({ usePathname: () => '/' }))

describe('NavBar', () => {
  it('renders the Voyages logo link', () => {
    render(<NavBar />)
    expect(screen.getByText('Voyages')).toBeInTheDocument()
  })

  it('renders all navigation links', () => {
    render(<NavBar />)
    expect(screen.getByText('Villages')).toBeInTheDocument()
    expect(screen.getByText('Journeys')).toBeInTheDocument()
    expect(screen.getByText('Itineraries')).toBeInTheDocument()
  })
})
