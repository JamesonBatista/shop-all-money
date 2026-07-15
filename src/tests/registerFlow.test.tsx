import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import './mocks/firebase'
import { MAX_BALANCE } from '../types'
import { expectMoneyText, setCurrencyDigits } from './helpers'
import { renderApp } from './test-utils'

describe('fluxo de registro e banco', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('registra usuário, mostra saldo e permite ir à loja', async () => {
    const user = userEvent.setup()
    renderApp(['/registro'])

    await screen.findByTestId('register-form')

    await user.type(screen.getByLabelText(/nome completo/i), 'Ana Clara Silva')
    await user.type(screen.getByLabelText(/^e-mail$/i), 'ana@bankshop.test')
    await user.type(screen.getByLabelText(/^senha$/i), 'senha123')
    await user.selectOptions(screen.getByLabelText(/cartão de crédito/i), 'Visa')

    await screen.findByLabelText(/valor em crédito/i)
    setCurrencyDigits(/valor em crédito/i, '1500000') // R$ 15.000,00

    await user.click(screen.getByRole('button', { name: /registrar e acessar/i }))

    expect(await screen.findByText(/saldo disponível/i)).toBeInTheDocument()
    expect(expectMoneyText(15000)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /ir para a loja/i }))
    expect(await screen.findByRole('heading', { name: /loja bank shop/i })).toBeInTheDocument()
  })

  it('mostra erro quando crédito ultrapassa 100 milhões', async () => {
    const user = userEvent.setup()
    renderApp(['/registro'])

    await screen.findByTestId('register-form')
    await user.selectOptions(screen.getByLabelText(/cartão de crédito/i), 'Mastercard')

    await screen.findByLabelText(/valor em crédito/i)
    const over = String(Math.floor(MAX_BALANCE * 100) + 1)
    setCurrencyDigits(/valor em crédito/i, over)

    await waitFor(() => {
      expect(screen.getByText(/máximo permitido/i)).toBeInTheDocument()
    })
  })

  it('faz login com conta registrada e bloqueia senha errada', async () => {
    const user = userEvent.setup()
    renderApp(['/registro'])

    await screen.findByTestId('register-form')
    await user.type(screen.getByLabelText(/nome completo/i), 'Bruno Costa')
    await user.type(screen.getByLabelText(/^e-mail$/i), 'bruno@bankshop.test')
    await user.type(screen.getByLabelText(/^senha$/i), 'abc123')
    await user.selectOptions(screen.getByLabelText(/cartão de crédito/i), 'Elo')
    await screen.findByLabelText(/valor em crédito/i)
    setCurrencyDigits(/valor em crédito/i, '500000') // R$ 5.000,00
    await user.click(screen.getByRole('button', { name: /registrar e acessar/i }))
    expect(await screen.findByText(/saldo disponível/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^sair$/i }))
    expect(await screen.findByRole('heading', { name: /acesse sua conta/i })).toBeInTheDocument()

    await user.type(screen.getByLabelText(/^e-mail$/i), 'bruno@bankshop.test')
    await user.type(screen.getByLabelText(/^senha$/i), 'errada')
    await user.click(screen.getByRole('button', { name: /entrar no banco/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/incorretos/i)

    await user.clear(screen.getByLabelText(/^senha$/i))
    await user.type(screen.getByLabelText(/^senha$/i), 'abc123')
    await user.click(screen.getByRole('button', { name: /entrar no banco/i }))
    expect(await screen.findByText(/saldo disponível/i)).toBeInTheDocument()
    expect(expectMoneyText(5000)).toBeInTheDocument()
  })

  it('deposita valor e respeita teto de 100 milhões', async () => {
    const user = userEvent.setup()
    renderApp(['/registro'])

    await screen.findByTestId('register-form')
    await user.type(screen.getByLabelText(/nome completo/i), 'Carla Dias')
    await user.type(screen.getByLabelText(/^e-mail$/i), 'carla@bankshop.test')
    await user.type(screen.getByLabelText(/^senha$/i), 'senha123')
    await user.selectOptions(screen.getByLabelText(/cartão de crédito/i), 'Visa')
    await screen.findByLabelText(/valor em crédito/i)
    setCurrencyDigits(/valor em crédito/i, '100000') // R$ 1.000,00
    await user.click(screen.getByRole('button', { name: /registrar e acessar/i }))
    expect(await screen.findByText(/saldo disponível/i)).toBeInTheDocument()
    expect(expectMoneyText(1000)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /depositar dinheiro/i }))
    const dialog = await screen.findByRole('dialog')
    const depositInput = within(dialog).getByLabelText(/valor do depósito/i)
    fireEvent.change(depositInput, { target: { value: '250050' } })
    await user.click(within(dialog).getByRole('button', { name: /confirmar depósito/i }))

    expect(await screen.findByText(/depósito realizado/i)).toBeInTheDocument()
    expect(expectMoneyText(3500.5)).toBeInTheDocument()
  })
})
