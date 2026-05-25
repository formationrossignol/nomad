// components/layout/NavBar.test.tsx
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { NavBar } from './NavBar'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/',
}))

jest.mock('@/lib/supabase/auth', () => ({
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
}))

const mockUseAuth = jest.fn()
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

afterEach(() => jest.clearAllMocks())

describe('NavBar', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ user: null, loading: false, signOut: jest.fn() })
  })

  it('renders the NØmad logo', () => {
    render(<NavBar />)
    expect(screen.getByLabelText('NØmad — accueil')).toBeInTheDocument()
  })

  it('renders all navigation links including pépites', () => {
    render(<NavBar />)
    expect(screen.getByText('Pépites')).toBeInTheDocument()
    expect(screen.getByText('Villages')).toBeInTheDocument()
    expect(screen.getByText('Voyages')).toBeInTheDocument()
    expect(screen.getByText('Itinéraires')).toBeInTheDocument()
  })

  it('shows Se connecter button when not authenticated', () => {
    render(<NavBar />)
    expect(screen.getByText('Se connecter')).toBeInTheDocument()
  })

  it('opens AuthModal when Se connecter is clicked', () => {
    render(<NavBar />)
    fireEvent.click(screen.getByText('Se connecter'))
    // Modal uses createPortal — check body
    expect(screen.getByTestId('auth-modal-overlay')).toBeInTheDocument()
  })

  it('shows avatar with initials when authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'loic@example.com' },
      loading: false,
      signOut: jest.fn(),
    })
    render(<NavBar />)
    expect(screen.getByText('LO')).toBeInTheDocument()
  })
})
