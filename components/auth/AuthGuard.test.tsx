import React from 'react'
import { render, screen } from '@testing-library/react'
import { AuthGuard } from './AuthGuard'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockUseAuth = jest.fn()
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

afterEach(() => jest.clearAllMocks())

describe('AuthGuard', () => {
  it('shows ShimmerLoader while loading', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true })
    render(<AuthGuard><p>Protected</p></AuthGuard>)
    expect(screen.queryByText('Protected')).not.toBeInTheDocument()
  })

  it('redirects to / when not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false })
    render(<AuthGuard><p>Protected</p></AuthGuard>)
    expect(mockPush).toHaveBeenCalledWith('/')
    expect(screen.queryByText('Protected')).not.toBeInTheDocument()
  })

  it('renders children when authenticated', () => {
    mockUseAuth.mockReturnValue({ user: { id: '1', email: 'u@test.com' }, loading: false })
    render(<AuthGuard><p>Protected</p></AuthGuard>)
    expect(screen.getByText('Protected')).toBeInTheDocument()
  })
})
