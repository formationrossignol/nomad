import { renderHook, act, waitFor } from '@testing-library/react'
import { useVisited } from './useVisited'

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockResolvedValue({ data: [
        { id: '1', village_slug: 'gordes', visited_at: '2023-06-01', personal_note: null }
      ], error: null }),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: { id: '2', village_slug: 'vezelay', visited_at: '2024-01-01', personal_note: null },
            error: null,
          }),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({ error: null }),
      })),
    })),
  },
}))

describe('useVisited', () => {
  it('loads visited villages on mount', async () => {
    const { result } = renderHook(() => useVisited())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.visitedSlugs.has('gordes')).toBe(true)
  })

  it('toggleVisited adds a village', async () => {
    const { result } = renderHook(() => useVisited())
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(() => result.current.toggleVisited('vezelay'))
    expect(result.current.visitedSlugs.has('vezelay')).toBe(true)
  })
})
