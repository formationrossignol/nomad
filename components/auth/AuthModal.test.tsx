import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthModal } from './AuthModal'
import * as authModule from '@/lib/supabase/auth'

jest.mock('@/lib/supabase/auth', () => ({
  signIn: jest.fn().mockResolvedValue({}),
  signUp: jest.fn().mockResolvedValue({}),
}))

const mockSignIn = authModule.signIn as jest.Mock

describe('AuthModal', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

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
    const onClose = jest.fn()
    render(<AuthModal isOpen onClose={onClose} />)
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('Mot de passe'), { target: { value: 'password123' } })
    fireEvent.submit(screen.getByRole('form'))
    await waitFor(() => expect(mockSignIn).toHaveBeenCalledWith('test@test.com', 'password123'))
    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it('displays error message on failed signIn', async () => {
    mockSignIn.mockRejectedValueOnce(new Error('Invalid login credentials'))
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
