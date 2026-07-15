import { screen, waitFor } from '@testing-library/react'
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

  it('navega categorias → lojas de relógios → Rolex com chrome e CTA temáticos', async () => {
    const user = userEvent.setup()
    await registerAndOpenShop(user)

    await user.click(screen.getByRole('button', { name: /relógios/i }))
    expect(await screen.findByRole('heading', { name: /^relógios$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /rolex/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /patek philippe/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /richard mille/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /rolex/i }))
    expect(await screen.findByRole('heading', { name: /oyster perpetual/i })).toBeInTheDocument()
    expect(screen.getByTestId('store-back')).toHaveTextContent(/world of rolex/i)
    expect(screen.getByTestId('store-cart')).toHaveTextContent(/my rolex/i)

    const buyButtons = screen.getAllByRole('button', { name: /reserve your rolex/i })
    expect(buyButtons.length).toBe(10)
    await user.click(buyButtons[0])
    expect(await screen.findByText(/adicionado à sacola/i)).toBeInTheDocument()
    await user.click(screen.getByTestId('store-cart'))
    expect(await screen.findByRole('heading', { name: /^carrinho$/i })).toBeInTheDocument()
  })

  it('Patek abre no estilo editorial Grand Complications com chrome próprio', async () => {
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
    expect(screen.getAllByRole('button', { name: /discover the model/i }).length).toBe(10)
    expect(screen.getByTestId('store-back')).toHaveTextContent(/collections/i)
    expect(screen.getByTestId('store-cart')).toHaveTextContent(/selection/i)
  })

  it('popup Aguardando Bank Shop → Compra realizada e abate saldo', async () => {
    const user = userEvent.setup()
    await registerAndOpenShop(user)

    const initialBalance = 500_000
    await user.click(screen.getByRole('button', { name: /eletrônicos/i }))
    await user.click(await screen.findByRole('button', { name: /bang & olufsen/i }))

    const buy = (await screen.findAllByRole('button', { name: /shop b&o/i }))[0]
    await user.click(buy)
    await user.click(screen.getByTestId('store-cart'))

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

    // Beosound A9 first B&O product at 12500
    expect(expectMoneyText(initialBalance - 12_500)).toBeInTheDocument()
  })

  it('histórico de cartões mostra compra após checkout', async () => {
    const user = userEvent.setup()
    await registerAndOpenShop(user)
    await user.click(screen.getByRole('button', { name: /eletrônicos/i }))
    await user.click(await screen.findByRole('button', { name: /bang & olufsen/i }))
    await user.click((await screen.findAllByRole('button', { name: /shop b&o/i }))[0])
    await user.click(screen.getByTestId('store-cart'))
    await user.click(screen.getByRole('button', { name: /pagar agora/i }))
    await waitFor(() => expect(screen.getByTestId('pay-success')).toBeInTheDocument(), {
      timeout: 4000,
    })
    const goBank = screen.getAllByRole('button', { name: /ir ao banco/i })
    await user.click(goBank[goBank.length - 1])
    await user.click(await screen.findByRole('button', { name: /cartões/i }))
    const cards = await screen.findByTestId('cards-panel')
    expect(cards).toHaveTextContent(/bang & olufsen/i)
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
    await user.click(screen.getAllByRole('button', { name: /reserve your rolex/i })[0])
    await user.click(screen.getByTestId('store-cart'))
    await user.click(screen.getByRole('button', { name: /pagar agora/i }))

    await waitFor(
      () => {
        expect(screen.getByRole('alert')).toHaveTextContent(/saldo insuficiente/i)
      },
      { timeout: 4000 },
    )
  })

  it('Rolex e AP usam CTAs e chrome diferentes entre si', async () => {
    const user = userEvent.setup()
    await registerAndOpenShop(user)
    await user.click(screen.getByRole('button', { name: /relógios/i }))
    await user.click(await screen.findByRole('button', { name: /rolex/i }))
    expect(screen.getAllByRole('button', { name: /reserve your rolex/i }).length).toBe(10)
    const rolexBack = screen.getByTestId('store-back').textContent
    const rolexCart = screen.getByTestId('store-cart').textContent

    await user.click(screen.getByTestId('store-back'))
    await user.click(await screen.findByRole('button', { name: /audemars piguet/i }))
    expect(screen.getAllByRole('button', { name: /explore royal oak/i }).length).toBe(10)
    expect(screen.getByTestId('store-back').textContent).not.toBe(rolexBack)
    expect(screen.getByTestId('store-cart').textContent).not.toBe(rolexCart)
  })
})
