import { renderHook, waitFor } from '@testing-library/react'
import { useAuth } from './useAuth'

const mockUnsubscribe = jest.fn()

jest.mock('@/lib/supabase/client', () => {
  const mockOnAuthStateChange = jest.fn(() => ({
    data: { subscription: { unsubscribe: jest.fn() } },
  }))
  return {
    supabase: {
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
        onAuthStateChange: mockOnAuthStateChange,
      },
    },
  }
})

jest.mock('@/lib/supabase/auth', () => ({
  signOut: jest.fn(),
}))

beforeEach(() => {
  jest.clearAllMocks()
  const { supabase } = require('@/lib/supabase/client')
  supabase.auth.onAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: mockUnsubscribe } },
  })
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('useAuth', () => {
  it('starts with loading true and no user', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBeNull()
  })

  it('sets loading false after session check with no user', async () => {
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).toBeNull()
  })

  it('sets user when session exists', async () => {
    const { supabase } = require('@/lib/supabase/client')
    const mockUser = { id: '1', email: 'user@test.com' }
    supabase.auth.getSession.mockResolvedValueOnce({
      data: { session: { user: mockUser } },
    })
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).toEqual(mockUser)
  })

  it('unsubscribes on unmount', async () => {
    const { unmount } = renderHook(() => useAuth())
    unmount()
    expect(mockUnsubscribe).toHaveBeenCalled()
  })
})
