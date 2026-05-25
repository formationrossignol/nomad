# Design : Auth, Nav Pépites, Clustering Villages

**Date:** 2026-05-25  
**Status:** Approved

---

## Scope

Three independent features implemented together:

1. **Auth module** — Supabase email/password login, modal overlay, `/account` page, route protection
2. **Pépites nav link** — Add `/pepites` to the existing navbar
3. **Village map clustering** — Replace raw CircleMarkers with `MarkerClusterGroup`

---

## 1. Auth Module

### Approach

Hook-based client guard (Option C). The project is 100% `'use client'` with no sensitive server-rendered content, making a shared `useAuth` hook the cleanest fit. No Next.js middleware required.

### New Files

| File | Purpose |
|------|---------|
| `lib/supabase/auth.ts` | `signIn`, `signOut`, `signUp` helpers wrapping Supabase auth methods |
| `hooks/useAuth.ts` | `{ user, loading, signOut }` via `onAuthStateChange` subscription |
| `components/auth/AuthModal.tsx` | React portal overlay with `mode: 'login' \| 'signup'` state. Toggle between views inline — no page navigation. |
| `components/auth/AuthGuard.tsx` | Wraps protected pages — redirects to login if `!user && !loading` |
| `app/account/page.tsx` | Avatar initials, display name, email, logout button |

### Auth Flow

1. User clicks "Se connecter" in navbar → `LoginModal` opens (portal, overlay)
2. Submit → `signIn()` → Supabase sets session cookie → `onAuthStateChange` fires → `useAuth` updates
3. Modal closes, navbar transitions to avatar state
4. "Pas de compte ?" in modal → toggles `AuthModal` to `mode='signup'` inline (no new page, no navigation)
5. `/account` — wrapped in `AuthGuard`, redirects to `/` if not authenticated

### Route Protection

Protected routes: `/journeys/*`, `/itineraries/*`  
Each page wrapped with `<AuthGuard>` component. When `loading=true` shows `ShimmerLoader`. When `!user` redirects to `/`.

### Navbar Connected State

- **Logged out:** "Se connecter" text button → opens `LoginModal`
- **Logged in:** Circle avatar with user initials (`font-cormorant italic`), click → dropdown with "Mon compte" (`/account`) and "Déconnexion"

---

## 2. Navbar — Pépites Link

### Change

Add `/pepites` as first link in the navigation list.

**Before:** `Villages · Voyages · Itinéraires`  
**After:** `Pépites · Villages · Voyages · Itinéraires`

Single edit in `components/layout/NavBar.tsx`. No other changes.

---

## 3. Village Map Clustering

### Problem

`VillageMapInner.tsx` renders raw Leaflet `CircleMarker` via `VillageMarker.tsx`. `MarkerClusterGroup` does not support `CircleMarker` — requires `Marker` with `divIcon`.

### Changes

**`components/village/VillageMapInner.tsx`:**
- Import `MarkerClusterGroup` from `react-leaflet-cluster`
- Import CSS from `react-leaflet-cluster/lib/assets/`
- Add `ClusterForcer` component (identical to pepites — fires `zoomend` after mount)
- Replace `VillageMarker` with `Marker` + inline `divIcon` inside `MarkerClusterGroup`
- Reuse `createClusterIcon` from pepites (same dark circle, count label)

**`components/village/VillageMarker.tsx`:**
- Deleted — replaced entirely by inline `divIcon` inside `VillageMapInner`. Not used elsewhere.

### Village Icon Design

```
Visited:     filled circle #163A70, white dot center
Not visited: transparent fill, border #163A70 1.5px, white dot center
```

Implemented as `L.divIcon` with inline styles.

### Click Behavior

Preserved: `onClick → onVillageClick(slug) → router.push(/villages/[slug])`

---

## Data Flow

```
useAuth (hook)
  └── NavBar: shows avatar or "Se connecter"
  └── LoginModal: submit → signIn → auth state update
  └── AuthGuard: redirects /journeys, /itineraries if !user

VillageMapInner
  └── ClusterForcer (fires zoomend on mount)
  └── MarkerClusterGroup
        └── Marker (divIcon, visited state)
              └── onClick → onVillageClick(slug)
```

---

## Files Modified

| File | Change |
|------|--------|
| `components/layout/NavBar.tsx` | Add pépites link, auth state (avatar/login button), dropdown |
| `components/village/VillageMapInner.tsx` | Add clustering, replace CircleMarker with Marker+divIcon |
| `lib/supabase/auth.ts` | New — auth helpers |
| `hooks/useAuth.ts` | New — auth state hook |
| `components/auth/AuthModal.tsx` | New — login + signup views in one modal |
| `components/auth/AuthGuard.tsx` | New |
| `app/account/page.tsx` | New |

---

## Error Handling

- Auth errors (wrong password, email exists): displayed inline in modal below the form
- Supabase network error: "Connexion impossible, réessayez." inline message
- `AuthGuard` loading state: `ShimmerLoader` (already exists) — no layout shift

---

## Out of Scope

- Password reset / forgot password flow
- Google OAuth
- User profile editing (name change, avatar upload)
- Email verification flow
