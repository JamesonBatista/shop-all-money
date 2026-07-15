import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import './mocks/firebase'
import { ADMIN_CREDENTIALS, trackRegister, trackVisit } from '../firebase/analytics'
import { renderApp } from './test-utils'

describe('painel admin', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('login com jambatista/satorogojo abre o painel de impacto', async () => {
    await trackVisit()
    await trackRegister('Usuário Teste')

    const user = userEvent.setup()
    renderApp(['/login'])

    await user.type(screen.getByLabelText(/e-mail ou usuário/i), ADMIN_CREDENTIALS.username)
    await user.type(screen.getByLabelText(/^senha$/i), ADMIN_CREDENTIALS.password)
    await user.click(screen.getByRole('button', { name: /entrar no banco/i }))

    expect(await screen.findByRole('heading', { name: /painel de impacto/i })).toBeInTheDocument()
    expect(screen.getByText(/^visitas totais$/i)).toBeInTheDocument()
    expect(screen.getByText(/^cadastros$/i)).toBeInTheDocument()
    expect(screen.getByText(/^compras$/i)).toBeInTheDocument()
  })

  it('bloqueia /admin sem sessão admin', async () => {
    renderApp(['/admin'])
    expect(await screen.findByRole('heading', { name: /acesse sua conta/i })).toBeInTheDocument()
  })
})
