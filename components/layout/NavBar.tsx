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
