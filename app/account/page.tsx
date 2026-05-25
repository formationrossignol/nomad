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
