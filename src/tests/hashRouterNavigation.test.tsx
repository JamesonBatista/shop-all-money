import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import './mocks/firebase'

vi.mock('../firebase/bootstrap', () => ({
  runSilentBankBootstrap: vi.fn().mockResolvedValue(undefined),
}))

import App from '../App'

describe('HashRouter — navegação real do App', () => {
  beforeEach(() => {
    localStorage.clear()
    window.location.hash = '#/login'
  })

  it('clique em Criar registro abre a tela de registro', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(await screen.findByRole('heading', { name: /acesse sua conta/i })).toBeInTheDocument()

    await user.click(screen.getByTestId('go-register'))

    await waitFor(() => {
      expect(screen.getByTestId('register-page')).toBeInTheDocument()
    })
    expect(screen.getByRole('heading', { name: /criar conta/i })).toBeInTheDocument()
    expect(window.location.hash).toMatch(/registro/)
  })
})
