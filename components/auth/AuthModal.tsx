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
      setEmail('')
      setPassword('')
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
            disabled={loading}
            className="font-inter text-[11px] tracking-[0.05em] border-b border-deep-blue/30 bg-transparent py-2 outline-none focus:border-deep-blue placeholder:text-deep-blue/30"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={loading}
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
