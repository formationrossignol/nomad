import { signIn, signUp, signOut } from './auth'

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn().mockResolvedValue({
        data: { user: { id: '1', email: 'test@test.com' } },
        error: null,
      }),
      signUp: jest.fn().mockResolvedValue({
        data: { user: { id: '2', email: 'new@test.com' } },
        error: null,
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
  },
}))

describe('auth helpers', () => {
  it('signIn calls signInWithPassword and returns data', async () => {
    const data = await signIn('test@test.com', 'password123')
    expect(data.user?.email).toBe('test@test.com')
  })

  it('signIn throws on error', async () => {
    const { supabase } = require('@/lib/supabase/client')
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: null,
      error: new Error('Invalid credentials'),
    })
    await expect(signIn('bad@test.com', 'wrong')).rejects.toThrow('Invalid credentials')
  })

  it('signUp calls supabase.auth.signUp and returns data', async () => {
    const data = await signUp('new@test.com', 'password123')
    expect(data.user?.email).toBe('new@test.com')
  })

  it('signUp throws on error', async () => {
    const { supabase } = require('@/lib/supabase/client')
    supabase.auth.signUp.mockResolvedValueOnce({
      data: null,
      error: new Error('Email already exists'),
    })
    await expect(signUp('new@test.com', 'password123')).rejects.toThrow('Email already exists')
  })

  it('signOut calls supabase.auth.signOut', async () => {
    const { supabase } = require('@/lib/supabase/client')
    await signOut()
    expect(supabase.auth.signOut).toHaveBeenCalled()
  })
})
