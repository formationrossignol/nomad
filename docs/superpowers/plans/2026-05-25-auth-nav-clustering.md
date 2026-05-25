# Auth / Nav Pépites / Village Clustering — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Supabase email/password auth with modal UI, a pépites nav link, and MarkerClusterGroup to the villages map.

**Architecture:** Hook-based client auth (`useAuth`) with no server middleware — the project is 100% `'use client'`. `AuthModal` (React portal) opens from the navbar. Protected routes (`/journeys/*`, `/itineraries/*`) use an `AuthGuard` wrapper that redirects to `/` when unauthenticated. Village clustering mirrors the existing pepites map pattern.

**Tech Stack:** Next.js 14 App Router, React 18, Supabase (`@supabase/ssr`), react-leaflet 4, react-leaflet-cluster 2, Jest + @testing-library/react

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `lib/supabase/auth.ts` | Create | `signIn`, `signUp`, `signOut` helpers |
| `hooks/useAuth.ts` | Create | `{ user, loading, signOut }` via `onAuthStateChange` |
| `hooks/useAuth.test.ts` | Create | Hook behaviour tests |
| `components/auth/AuthModal.tsx` | Create | Login/signup portal modal, mode toggle |
| `components/auth/AuthModal.test.tsx` | Create | Render, submit, error, mode toggle tests |
| `components/auth/AuthGuard.tsx` | Create | Route protection wrapper |
| `components/auth/AuthGuard.test.tsx` | Create | Redirect + loading state tests |
| `app/account/page.tsx` | Create | Avatar, email, logout |
| `components/layout/NavBar.tsx` | Modify | Add `'use client'`, pépites link, auth state |
| `components/layout/NavBar.test.tsx` | Modify | Fix stale assertions, add auth state tests |
| `app/journeys/layout.tsx` | Create | Client layout wrapping all `/journeys/*` in `AuthGuard` |
| `app/itineraries/layout.tsx` | Create | Client layout wrapping all `/itineraries/*` in `AuthGuard` |
| `__mocks__/react-leaflet.tsx` | Modify | Add `Marker` export |
| `__mocks__/leaflet.ts` | Modify | Add `divIcon` mock |
| `__mocks__/react-leaflet-cluster.tsx` | Create | `MarkerClusterGroup` mock |
| `jest.config.ts` | Modify | Add `react-leaflet-cluster` to `moduleNameMapper` |
| `components/village/VillageMapInner.tsx` | Modify | Replace CircleMarker with clustered `Marker+divIcon` |
| `components/village/VillageMarker.tsx` | Delete | Replaced by inline divIcon |

---

## Task 1: Auth helpers

**Files:**
- Create: `lib/supabase/auth.ts`
- Create: `lib/supabase/auth.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// lib/supabase/auth.test.ts
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

  it('signOut calls supabase.auth.signOut', async () => {
    await expect(signOut()).resolves.not.toThrow()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest lib/supabase/auth.test.ts --no-coverage
```
Expected: `Cannot find module './auth'`

- [ ] **Step 3: Implement auth helpers**

```typescript
// lib/supabase/auth.ts
import { supabase } from './client'

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx jest lib/supabase/auth.test.ts --no-coverage
```
Expected: 4 tests passing

- [ ] **Step 5: Commit**

```bash
git add lib/supabase/auth.ts lib/supabase/auth.test.ts
git commit -m "feat(auth): add signIn/signUp/signOut helpers"
```

---

## Task 2: useAuth hook

**Files:**
- Create: `hooks/useAuth.ts`
- Create: `hooks/useAuth.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// hooks/useAuth.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { useAuth } from './useAuth'

const mockUnsubscribe = jest.fn()
const mockOnAuthStateChange = jest.fn()

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: mockOnAuthStateChange,
    },
  },
}))

jest.mock('@/lib/supabase/auth', () => ({
  signOut: jest.fn(),
}))

beforeEach(() => {
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest hooks/useAuth.test.ts --no-coverage
```
Expected: `Cannot find module './useAuth'`

- [ ] **Step 3: Implement useAuth hook**

```typescript
// hooks/useAuth.ts
'use client'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { signOut as authSignOut } from '@/lib/supabase/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading, signOut: authSignOut }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx jest hooks/useAuth.test.ts --no-coverage
```
Expected: 4 tests passing

- [ ] **Step 5: Commit**

```bash
git add hooks/useAuth.ts hooks/useAuth.test.ts
git commit -m "feat(auth): add useAuth hook with session subscription"
```

---

## Task 3: AuthModal component

**Files:**
- Create: `components/auth/AuthModal.tsx`
- Create: `components/auth/AuthModal.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
// components/auth/AuthModal.test.tsx
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthModal } from './AuthModal'

jest.mock('@/lib/supabase/auth', () => ({
  signIn: jest.fn().mockResolvedValue({}),
  signUp: jest.fn().mockResolvedValue({}),
}))

describe('AuthModal', () => {
  it('renders nothing when closed', () => {
    render(<AuthModal isOpen={false} onClose={jest.fn()} />)
    expect(screen.queryByPlaceholderText('Email')).not.toBeInTheDocument()
  })

  it('renders login form when open', () => {
    render(<AuthModal isOpen onClose={jest.fn()} />)
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Mot de passe')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Se connecter' })).toBeInTheDocument()
  })

  it('toggles to signup mode', () => {
    render(<AuthModal isOpen onClose={jest.fn()} />)
    fireEvent.click(screen.getByText("S'inscrire"))
    expect(screen.getByRole('button', { name: "S'inscrire" })).toBeInTheDocument()
  })

  it('calls signIn on login submit', async () => {
    const { signIn } = require('@/lib/supabase/auth')
    const onClose = jest.fn()
    render(<AuthModal isOpen onClose={onClose} />)
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('Mot de passe'), { target: { value: 'password123' } })
    fireEvent.submit(screen.getByRole('form'))
    await waitFor(() => expect(signIn).toHaveBeenCalledWith('test@test.com', 'password123'))
    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it('displays error message on failed signIn', async () => {
    const { signIn } = require('@/lib/supabase/auth')
    signIn.mockRejectedValueOnce(new Error('Invalid login credentials'))
    render(<AuthModal isOpen onClose={jest.fn()} />)
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'bad@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('Mot de passe'), { target: { value: 'wrong' } })
    fireEvent.submit(screen.getByRole('form'))
    await waitFor(() => expect(screen.getByText('Invalid login credentials')).toBeInTheDocument())
  })

  it('closes when overlay is clicked', () => {
    const onClose = jest.fn()
    render(<AuthModal isOpen onClose={onClose} />)
    fireEvent.click(screen.getByTestId('auth-modal-overlay'))
    expect(onClose).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest components/auth/AuthModal.test.tsx --no-coverage
```
Expected: `Cannot find module './AuthModal'`

- [ ] **Step 3: Implement AuthModal**

```typescript
// components/auth/AuthModal.tsx
'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { signIn, signUp } from '@/lib/supabase/auth'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: Props) {
  const [mounted, setMounted] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!isOpen || !mounted) return null

  function handleModeToggle() {
    setMode(m => m === 'login' ? 'signup' : 'login')
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
      } else {
        await signUp(email, password)
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion impossible, réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return createPortal(
    <div
      data-testid="auth-modal-overlay"
      className="fixed inset-0 z-[2000] flex items-center justify-center"
      style={{ background: 'rgba(13,27,42,0.6)' }}
      onClick={onClose}
    >
      <div
        className="bg-ivory w-full max-w-sm p-10"
        style={{ boxShadow: '0 8px 40px rgba(13,27,42,0.25)' }}
        onClick={e => e.stopPropagation()}
      >
        <p className="font-inter text-[8px] tracking-[0.25em] uppercase text-deep-blue/40 mb-3">
          {mode === 'login' ? 'Connexion' : 'Inscription'}
        </p>
        <h2 className="font-cormorant italic text-[28px] text-deep-blue mb-8">
          {mode === 'login' ? 'Bienvenue' : 'Créer un compte'}
        </h2>

        <form role="form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="font-inter text-[11px] tracking-[0.05em] border-b border-deep-blue/30 bg-transparent py-2 outline-none focus:border-deep-blue placeholder:text-deep-blue/30"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="font-inter text-[11px] tracking-[0.05em] border-b border-deep-blue/30 bg-transparent py-2 outline-none focus:border-deep-blue placeholder:text-deep-blue/30"
          />
          {error && (
            <p className="font-inter text-[10px] text-red-600">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="font-inter text-[9px] tracking-[0.2em] uppercase bg-deep-blue text-ivory py-3 mt-2 hover:bg-cobalt transition-colors disabled:opacity-50"
          >
            {loading ? '...' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
          </button>
        </form>

        <p className="font-inter text-[9px] tracking-[0.05em] text-deep-blue/50 mt-4 text-center">
          {mode === 'login' ? 'Pas de compte ? ' : 'Déjà inscrit ? '}
          <button
            type="button"
            onClick={handleModeToggle}
            className="underline text-deep-blue/70 hover:text-deep-blue"
          >
            {mode === 'login' ? "S'inscrire" : 'Se connecter'}
          </button>
        </p>
      </div>
    </div>,
    document.body
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx jest components/auth/AuthModal.test.tsx --no-coverage
```
Expected: 6 tests passing

- [ ] **Step 5: Commit**

```bash
git add components/auth/AuthModal.tsx components/auth/AuthModal.test.tsx
git commit -m "feat(auth): add AuthModal with login/signup toggle"
```

---

## Task 4: AuthGuard component

**Files:**
- Create: `components/auth/AuthGuard.tsx`
- Create: `components/auth/AuthGuard.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
// components/auth/AuthGuard.test.tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest components/auth/AuthGuard.test.tsx --no-coverage
```
Expected: `Cannot find module './AuthGuard'`

- [ ] **Step 3: Implement AuthGuard**

```typescript
// components/auth/AuthGuard.tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { ShimmerLoader } from '@/components/layout/ShimmerLoader'

interface Props {
  children: React.ReactNode
}

export function AuthGuard({ children }: Props) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) return <ShimmerLoader className="h-screen w-full" />
  if (!user) return null
  return <>{children}</>
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx jest components/auth/AuthGuard.test.tsx --no-coverage
```
Expected: 3 tests passing

- [ ] **Step 5: Commit**

```bash
git add components/auth/AuthGuard.tsx components/auth/AuthGuard.test.tsx
git commit -m "feat(auth): add AuthGuard — redirects unauthenticated users to /"
```

---

## Task 5: Account page

**Files:**
- Create: `app/account/page.tsx`

- [ ] **Step 1: Create the account page**

```typescript
// app/account/page.tsx
'use client'
import { useRouter } from 'next/navigation'
import { PageTransition } from '@/components/layout/PageTransition'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { useAuth } from '@/hooks/useAuth'

function AccountContent() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  const initials = (user?.email ?? '??').slice(0, 2).toUpperCase()

  return (
    <section className="bg-ivory min-h-screen py-20 px-12">
      <p className="font-inter text-[9px] tracking-[0.28em] uppercase text-deep-blue/40 mb-3">
        Mon compte
      </p>
      <h1 className="font-cormorant italic text-[38px] text-deep-blue leading-tight mb-3">
        Profil
      </h1>
      <div className="w-8 h-px bg-champagne mb-10" />

      <div className="flex items-center gap-6 mb-12">
        <div className="w-16 h-16 rounded-full bg-deep-blue flex items-center justify-center">
          <span className="font-cormorant italic text-[22px] text-ivory">{initials}</span>
        </div>
        <div>
          <p className="font-inter text-[13px] text-deep-blue">{user?.email}</p>
          <p className="font-inter text-[10px] text-deep-blue/40 tracking-widest uppercase mt-1">
            Membre
          </p>
        </div>
      </div>

      <button
        onClick={handleSignOut}
        className="font-inter text-[9px] tracking-[0.2em] uppercase border border-deep-blue/30 text-deep-blue px-6 py-2 hover:bg-deep-blue hover:text-ivory transition-colors"
      >
        Déconnexion
      </button>
    </section>
  )
}

export default function AccountPage() {
  return (
    <PageTransition>
      <AuthGuard>
        <AccountContent />
      </AuthGuard>
    </PageTransition>
  )
}
```

- [ ] **Step 2: Run full test suite to confirm nothing broke**

```bash
npx jest --no-coverage
```
Expected: all existing tests pass

- [ ] **Step 3: Commit**

```bash
git add app/account/page.tsx
git commit -m "feat(auth): add /account page with avatar, email, logout"
```

---

## Task 6: NavBar — pépites link + auth state

**Files:**
- Modify: `components/layout/NavBar.tsx`
- Modify: `components/layout/NavBar.test.tsx`

- [ ] **Step 1: Update the test first**

Replace the entire content of `components/layout/NavBar.test.tsx`:

```typescript
// components/layout/NavBar.test.tsx
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { NavBar } from './NavBar'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/',
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest components/layout/NavBar.test.tsx --no-coverage
```
Expected: failures on missing `useAuth`, pépites link, avatar

- [ ] **Step 3: Rewrite NavBar**

Replace the entire content of `components/layout/NavBar.tsx`:

```typescript
// components/layout/NavBar.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { AuthModal } from '@/components/auth/AuthModal'

const NAV_LINKS = [
  { href: '/pepites', label: 'Pépites' },
  { href: '/villages', label: 'Villages' },
  { href: '/journeys', label: 'Voyages' },
  { href: '/itineraries', label: 'Itinéraires' },
]

const LINK_CLASS =
  'font-inter text-[9px] tracking-[0.2em] uppercase text-ivory/70 hover:text-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory/60 transition-colors duration-200'

function NomadLogo() {
  return (
    <Link href="/" className="flex items-center gap-0 group" aria-label="NØmad — accueil">
      <span className="font-cormorant italic text-[20px] text-ivory leading-none" style={{ letterSpacing: '-0.01em' }}>
        N
      </span>
      <span className="font-cormorant italic text-[20px] leading-none" style={{ color: '#D6C3A5', letterSpacing: '-0.01em' }}>
        ø
      </span>
      <span className="font-cormorant italic text-[20px] text-ivory/80 leading-none" style={{ letterSpacing: '-0.01em' }}>
        mad
      </span>
    </Link>
  )
}

function UserAvatar({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const [open, setOpen] = useState(false)
  const initials = email.slice(0, 2).toUpperCase()

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-7 h-7 rounded-full bg-champagne flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory/60"
        aria-label="Menu compte"
      >
        <span className="font-cormorant italic text-[13px] text-midnight">{initials}</span>
      </button>
      {open && (
        <div
          className="absolute right-0 top-9 bg-midnight border border-champagne/20 min-w-[140px] py-1"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
        >
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 font-inter text-[9px] tracking-[0.15em] uppercase text-ivory/70 hover:text-ivory hover:bg-white/5"
          >
            Mon compte
          </Link>
          <button
            onClick={() => { setOpen(false); onSignOut() }}
            className="w-full text-left px-4 py-2 font-inter text-[9px] tracking-[0.15em] uppercase text-ivory/70 hover:text-ivory hover:bg-white/5"
          >
            Déconnexion
          </button>
        </div>
      )}
    </div>
  )
}

export function NavBar() {
  const { user, loading, signOut } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-[52px] flex items-center justify-between px-8 bg-midnight/95 border-b border-champagne/10">
        <NomadLogo />
        <nav aria-label="Navigation du site" className="flex gap-7 items-center">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={LINK_CLASS}>
              {label}
            </Link>
          ))}

          {!loading && (
            user
              ? <UserAvatar email={user.email ?? ''} onSignOut={signOut} />
              : (
                <button
                  onClick={() => setModalOpen(true)}
                  className="font-inter text-[9px] tracking-[0.2em] uppercase text-champagne hover:text-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory/60 transition-colors duration-200"
                >
                  Se connecter
                </button>
              )
          )}
        </nav>
      </header>
      <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx jest components/layout/NavBar.test.tsx --no-coverage
```
Expected: 5 tests passing

- [ ] **Step 5: Commit**

```bash
git add components/layout/NavBar.tsx components/layout/NavBar.test.tsx
git commit -m "feat(nav): add pépites link and auth state to NavBar"
```

---

## Task 7: Protect routes

**Files:**
- Create: `app/journeys/layout.tsx`
- Create: `app/itineraries/layout.tsx`

Some pages under `/journeys` and `/itineraries` are server components (async functions using `createSupabaseServerClient`). `AuthGuard` is a client component — it cannot be imported inside a server component. The solution: create a `'use client'` layout file for each group. Next.js 14 App Router layouts wrap all routes in their directory, so two files protect all subroutes automatically.

- [ ] **Step 1: Create `app/journeys/layout.tsx`**

```typescript
// app/journeys/layout.tsx
'use client'
import { AuthGuard } from '@/components/auth/AuthGuard'

export default function JourneysLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>
}
```

- [ ] **Step 2: Create `app/itineraries/layout.tsx`**

```typescript
// app/itineraries/layout.tsx
'use client'
import { AuthGuard } from '@/components/auth/AuthGuard'

export default function ItinerariesLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>
}
```

- [ ] **Step 3: Run full test suite**

```bash
npx jest --no-coverage
```
Expected: all tests pass

- [ ] **Step 4: Commit**

```bash
git add app/journeys/layout.tsx app/itineraries/layout.tsx
git commit -m "feat(auth): protect /journeys and /itineraries via layout AuthGuard"
```

---

## Task 8: Village map clustering

**Files:**
- Modify: `jest.config.ts`
- Create: `__mocks__/react-leaflet-cluster.tsx`
- Modify: `__mocks__/react-leaflet.tsx`
- Modify: `__mocks__/leaflet.ts`
- Modify: `components/village/VillageMapInner.tsx`
- Delete: `components/village/VillageMarker.tsx`
- Modify: `components/village/VillageMap.test.tsx`

- [ ] **Step 1: Add react-leaflet-cluster to moduleNameMapper in `jest.config.ts`**

```typescript
// jest.config.ts — update moduleNameMapper:
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
  '^react-leaflet$': '<rootDir>/__mocks__/react-leaflet.tsx',
  '^react-leaflet-cluster$': '<rootDir>/__mocks__/react-leaflet-cluster.tsx',
  '^leaflet$': '<rootDir>/__mocks__/leaflet.ts',
},
```

- [ ] **Step 2: Create `__mocks__/react-leaflet-cluster.tsx`**

```typescript
// __mocks__/react-leaflet-cluster.tsx
import React from 'react'

const MarkerClusterGroup = ({ children }: { children?: React.ReactNode }) => (
  <div data-testid="marker-cluster-group">{children}</div>
)

export default MarkerClusterGroup
```

- [ ] **Step 3: Add `Marker` and `divIcon` to react-leaflet and leaflet mocks**

Replace the full contents of `__mocks__/react-leaflet.tsx`:

```typescript
// __mocks__/react-leaflet.tsx
import React from 'react'

export const MapContainer = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="map-container">{children}</div>
)
export const TileLayer = () => null
export const Polyline = () => null
export const Marker = ({ children, eventHandlers }: { children?: React.ReactNode; eventHandlers?: Record<string, () => void> }) => (
  <div data-testid="marker" onClick={eventHandlers?.click}>{children}</div>
)
export const CircleMarker = ({ children }: { children?: React.ReactNode }) => (
  <div data-testid="circle-marker">{children}</div>
)
export const Tooltip = ({ children }: { children?: React.ReactNode }) => (
  <div data-testid="tooltip">{children}</div>
)
export const useMap = () => ({
  setView: jest.fn(),
  addLayer: jest.fn(),
  removeLayer: jest.fn(),
  fire: jest.fn(),
})
export const useMapEvents = (_handlers: Record<string, (_e: unknown) => void>) => null
```

Add `divIcon` to `__mocks__/leaflet.ts`:

```typescript
// __mocks__/leaflet.ts — add divIcon to the L object:
const L = {
  circleMarker: jest.fn(() => ({
    on: jest.fn().mockReturnThis(),
    addTo: jest.fn().mockReturnThis(),
    bindTooltip: jest.fn().mockReturnThis(),
    remove: jest.fn(),
    setStyle: jest.fn(),
  })),
  divIcon: jest.fn(() => ({ options: {} })),
  polyline: jest.fn(() => ({
    addTo: jest.fn().mockReturnThis(),
    remove: jest.fn(),
  })),
}
export default L
module.exports = L
```

- [ ] **Step 4: Update `components/village/VillageMap.test.tsx`**

```typescript
// components/village/VillageMap.test.tsx
import { render, screen } from '@testing-library/react'
import { VillageMap } from './VillageMap'
import type { Village } from '@/types'

const mockVillages: Village[] = [
  {
    slug: 'gordes', name: 'Gordes', region: 'Provence', department: 'Vaucluse',
    lat: 43.9117, lng: 5.2011, description: '', tags: [], heroImage: '',
    visitDurationMinutes: 120,
  },
]

describe('VillageMap', () => {
  it('renders the map container', () => {
    render(
      <VillageMap
        villages={mockVillages}
        visitedSlugs={new Set()}
      />
    )
    expect(document.body).toBeInTheDocument()
  })
})
```

- [ ] **Step 5: Run test to verify mocks work**

```bash
npx jest components/village/VillageMap.test.tsx --no-coverage
```
Expected: 1 test passing

- [ ] **Step 6: Replace `components/village/VillageMapInner.tsx`**

```typescript
// components/village/VillageMapInner.tsx
'use client'
import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import 'react-leaflet-cluster/lib/assets/MarkerCluster.css'
import 'react-leaflet-cluster/lib/assets/MarkerCluster.Default.css'
import type { Village } from '@/types'

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY
const TILE_URL = `https://api.maptiler.com/maps/positron/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`
const FRANCE_CENTER: [number, number] = [46.8, 2.3]

function createVillageIcon(isVisited: boolean, isActive: boolean) {
  const size = isActive ? 20 : 14
  const bg = isVisited ? '#163A70' : 'transparent'
  const border = isVisited ? 'none' : '1.5px solid #163A70'
  const dotSize = isActive ? 5 : 4
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      border-radius:50%;
      background:${bg};
      border:${border};
      display:flex;align-items:center;justify-content:center;
      cursor:pointer;
    "><div style="
      width:${dotSize}px;height:${dotSize}px;
      border-radius:50%;
      background:${isVisited ? 'white' : '#163A70'};
    "></div></div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createClusterIcon(cluster: any) {
  const count = cluster.getChildCount()
  const size = count < 10 ? 34 : count < 100 ? 40 : 48
  const fontSize = count < 10 ? 13 : count < 100 ? 12 : 11
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      background:rgba(13,27,42,0.82);
      border:2.5px solid rgba(255,255,255,0.9);
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 3px 12px rgba(0,0,0,0.35);
      cursor:pointer;
    "><span style="
      font-family:'Inter',sans-serif;
      font-size:${fontSize}px;
      font-weight:600;
      color:white;
      letter-spacing:-0.02em;
      line-height:1;
    ">${count}</span></div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function ClusterForcer() {
  const map = useMap()
  useEffect(() => {
    map.fire('zoomend')
  }, [map])
  return null
}

interface VillageMapInnerProps {
  villages: Village[]
  visitedSlugs: Set<string>
  activeSlug?: string | null
  onVillageClick?: (slug: string) => void
}

export default function VillageMapInner({
  villages,
  visitedSlugs,
  activeSlug,
  onVillageClick,
}: VillageMapInnerProps) {
  return (
    <MapContainer center={FRANCE_CENTER} zoom={6} className="h-full w-full" zoomControl={false}>
      <TileLayer
        url={TILE_URL}
        attribution='© <a href="https://www.maptiler.com">MapTiler</a> © <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
        tileSize={512}
        zoomOffset={-1}
      />
      <ClusterForcer />
      <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={createClusterIcon}
        maxClusterRadius={60}
        spiderfyOnMaxZoom
        showCoverageOnHover={false}
        zoomToBoundsOnClick
      >
        {villages.map(v => (
          <Marker
            key={v.slug}
            position={[v.lat, v.lng]}
            icon={createVillageIcon(visitedSlugs.has(v.slug), activeSlug === v.slug)}
            eventHandlers={{ click: () => onVillageClick?.(v.slug) }}
          />
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  )
}
```

- [ ] **Step 7: Delete `components/village/VillageMarker.tsx`**

```bash
rm components/village/VillageMarker.tsx
```

- [ ] **Step 8: Run full test suite**

```bash
npx jest --no-coverage
```
Expected: all tests pass (VillageMap test passes, no broken imports)

- [ ] **Step 9: Commit**

```bash
git add jest.config.ts __mocks__/react-leaflet-cluster.tsx __mocks__/react-leaflet.tsx __mocks__/leaflet.ts components/village/VillageMapInner.tsx components/village/VillageMap.test.tsx
git rm components/village/VillageMarker.tsx
git commit -m "feat(map): add MarkerClusterGroup to village map, remove VillageMarker"
```

---

## Final: push

```bash
git push origin main
```
