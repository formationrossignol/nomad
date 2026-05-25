import { renderHook, waitFor } from '@testing-library/react'
import { useAuth } from './useAuth'
import { supabase } from '@/lib/supabase/client'

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

const mockGetSession = supabase.auth.getSession as jest.Mock
const mockOnAuthStateChange = supabase.auth.onAuthStateChange as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
  mockOnAuthStateChange.mockReturnValue({
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
    const mockUser = { id: '1', email: 'user@test.com' }
    mockGetSession.mockResolvedValueOnce({
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
