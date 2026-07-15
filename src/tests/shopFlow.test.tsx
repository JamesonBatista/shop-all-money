import { screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import './mocks/firebase'
import { expectMoneyText, setCurrencyDigits } from './helpers'
import { renderApp } from './test-utils'

vi.mock('../services/emailService', () => ({
  sendPurchaseEmail: vi.fn().mockResolvedValue('sent'),
  buildPurchaseEmailHtml: vi.fn().mockReturnValue('<html></html>'),
}))

async function registerAndOpenShop(user: ReturnType<typeof userEvent.setup>) {
  renderApp(['/registro'])
  await screen.findByTestId('register-form')
  await user.type(screen.getByLabelText(/nome completo/i), 'Diego Alves')
  await user.type(screen.getByLabelText(/^e-mail$/i), 'diego@bankshop.test')
  await user.type(screen.getByLabelText(/^senha$/i), 'senha123')
  await user.selectOptions(screen.getByLabelText(/cartão de crédito/i), 'Visa')
  await screen.findByLabelText(/valor em crédito/i)
  setCurrencyDigits(/valor em crédito/i, '50000000') // R$ 500.000,00
  await user.click(screen.getByRole('button', { name: /registrar e acessar/i }))
  expect(await screen.findByText(/saldo disponível/i)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /ir para a loja/i }))
  expect(await screen.findByRole('heading', { name: /loja bank shop/i })).toBeInTheDocument()
}

describe('fluxo da loja e carrinho', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('navega categorias → lojas de relógios → Rolex → sacola com CTA próprio', async () => {
    const user = userEvent.setup()
    await registerAndOpenShop(user)

    await user.click(screen.getByRole('button', { name: /relógios/i }))
    expect(await screen.findByRole('heading', { name: /^relógios$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /rolex/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /rolex/i }))
    expect(await screen.findByRole('heading', { name: /^rolex$/i })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /reservar peça/i }).length).toBeGreaterThan(0)

    const buyButtons = screen.getAllByRole('button', { name: /reservar peça/i })
    await user.click(buyButtons[0])
    expect(await screen.findByText(/adicionado à sacola/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /sacola \(1\)/i }))
    expect(await screen.findByRole('heading', { name: /^carrinho$/i })).toBeInTheDocument()
  })

  it('Patek abre no estilo editorial Grand Complications', async () => {
    const user = userEvent.setup()
    await registerAndOpenShop(user)

    await user.click(screen.getByRole('button', { name: /relógios/i }))
    await user.click(await screen.findByRole('button', { name: /patek philippe/i }))

    expect(await screen.findByRole('heading', { name: /grand complications/i })).toBeInTheDocument()
    expect(screen.getByText(/^collection$/i)).toBeInTheDocument()
    expect(screen.getByText(/models displayed/i)).toBeInTheDocument()
    expect(screen.getByText(/^5320G-011$/i)).toBeInTheDocument()
    expect(screen.getAllByText(/^perpetual calendar$/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/^white gold$/i).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /adquirir legado/i }).length).toBe(10)
  })

  it('popup Aguardando Bank Shop → Compra realizada e abate saldo', async () => {
    const user = userEvent.setup()
    await registerAndOpenShop(user)

    const initialBalance = 500_000
    await user.click(screen.getByRole('button', { name: /relógios/i }))
    await user.click(await screen.findByRole('button', { name: /omega/i }))

    const buy = (await screen.findAllByRole('button', { name: /comprar agora/i }))[0]
    await user.click(buy)
    await user.click(screen.getByRole('button', { name: /sacola \(1\)/i }))

    await user.click(screen.getByRole('button', { name: /pagar agora/i }))
    expect(await screen.findByTestId('pay-waiting')).toHaveTextContent(/aguardando bank shop/i)

    await waitFor(
      () => {
        expect(screen.getByTestId('pay-success')).toHaveTextContent(/compra realizada/i)
      },
      { timeout: 4000 },
    )

    const goBank = screen.getAllByRole('button', { name: /ir ao banco/i })
    await user.click(goBank[goBank.length - 1])
    expect(await screen.findByText(/saldo disponível/i)).toBeInTheDocument()

    // Speedmaster is first omega product at 42000
    expect(expectMoneyText(initialBalance - 42_000)).toBeInTheDocument()
  })

  it('histórico de cartões mostra compra após checkout', async () => {
    const user = userEvent.setup()
    await registerAndOpenShop(user)
    await user.click(screen.getByRole('button', { name: /relógios/i }))
    await user.click(await screen.findByRole('button', { name: /omega/i }))
    await user.click((await screen.findAllByRole('button', { name: /comprar agora/i }))[0])
    await user.click(screen.getByRole('button', { name: /sacola \(1\)/i }))
    await user.click(screen.getByRole('button', { name: /pagar agora/i }))
    await waitFor(() => expect(screen.getByTestId('pay-success')).toBeInTheDocument(), {
      timeout: 4000,
    })
    const goBank = screen.getAllByRole('button', { name: /ir ao banco/i })
    await user.click(goBank[goBank.length - 1])
    await user.click(await screen.findByRole('button', { name: /cartões/i }))
    const cards = await screen.findByTestId('cards-panel')
    expect(cards).toHaveTextContent(/omega/i)
  })

  it('bloqueia compra sem saldo e mostra erro no popup', async () => {
    const user = userEvent.setup()
    renderApp(['/registro'])
    await screen.findByTestId('register-form')
    await user.type(screen.getByLabelText(/nome completo/i), 'Eva Lima')
    await user.type(screen.getByLabelText(/^e-mail$/i), 'eva@bankshop.test')
    await user.type(screen.getByLabelText(/^senha$/i), 'senha123')
    await user.selectOptions(screen.getByLabelText(/cartão de crédito/i), 'Visa')
    await screen.findByLabelText(/valor em crédito/i)
    setCurrencyDigits(/valor em crédito/i, '10000') // R$ 100,00
    await user.click(screen.getByRole('button', { name: /registrar e acessar/i }))
    await screen.findByText(/saldo disponível/i)

    await user.click(screen.getByRole('button', { name: /ir para a loja/i }))
    await user.click(await screen.findByRole('button', { name: /relógios/i }))
    await user.click(await screen.findByRole('button', { name: /rolex/i }))
    await user.click(screen.getAllByRole('button', { name: /reservar peça/i })[0])
    await user.click(screen.getByRole('button', { name: /sacola \(1\)/i }))
    await user.click(screen.getByRole('button', { name: /pagar agora/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/saldo insuficiente/i)
    }, { timeout: 4000 })
  })

  it('cada boutique Rolex e AP usa CTAs diferentes', async () => {
    const user = userEvent.setup()
    await registerAndOpenShop(user)
    await user.click(screen.getByRole('button', { name: /relógios/i }))
    await user.click(await screen.findByRole('button', { name: /rolex/i }))
    expect(screen.getAllByRole('button', { name: /reservar peça/i }).length).toBe(10)

    await user.click(screen.getByRole('button', { name: /voltar às lojas/i }))
    await user.click(await screen.findByRole('button', { name: /audemars piguet/i }))
    expect(screen.getAllByRole('button', { name: /levar royal oak/i }).length).toBe(10)
  })
})
