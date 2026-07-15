import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import './mocks/firebase'
import { renderApp } from './test-utils'

describe('navegação auth', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('abre a tela de registro ao clicar em Criar registro', async () => {
    const user = userEvent.setup()
    renderApp(['/login'])

    expect(await screen.findByRole('heading', { name: /acesse sua conta/i })).toBeInTheDocument()

    await user.click(screen.getByTestId('go-register'))

    expect(await screen.findByTestId('register-page')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /criar conta/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument()
  })

  it('volta para login a partir do registro', async () => {
    const user = userEvent.setup()
    renderApp(['/registro'])

    expect(await screen.findByTestId('register-page')).toBeInTheDocument()
    await user.click(screen.getByTestId('go-login'))

    expect(await screen.findByRole('heading', { name: /acesse sua conta/i })).toBeInTheDocument()
  })

  it('renderiza registro diretamente pela rota /registro', async () => {
    renderApp(['/registro'])
    await waitFor(() => {
      expect(screen.getByTestId('register-page')).toBeInTheDocument()
    })
  })
})
