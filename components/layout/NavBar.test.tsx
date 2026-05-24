import React from 'react'
import { render, screen } from '@testing-library/react'
import { NavBar } from './NavBar'

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, style, className }: React.HTMLAttributes<HTMLDivElement>) =>
      React.createElement('div', { style, className }, children),
  },
  useScroll: () => ({ scrollY: { get: () => 0 } }),
  useTransform: () => 0,
}))

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
