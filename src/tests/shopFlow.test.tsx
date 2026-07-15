import { screen, within } from '@testing-library/react'
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

  it('navega categorias → lojas de relógios → Rolex → carrinho', async () => {
    const user = userEvent.setup()
    await registerAndOpenShop(user)

    await user.click(screen.getByRole('button', { name: /relógios/i }))
    expect(await screen.findByRole('heading', { name: /^relógios$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /rolex/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /patek philippe/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /rolex/i }))
    expect(await screen.findByRole('heading', { name: /^rolex$/i })).toBeInTheDocument()
    expect(screen.getByText(/cosmograph daytona/i)).toBeInTheDocument()

    const productCard = screen.getByText(/submariner date/i).closest('.product-card')
    expect(productCard).toBeTruthy()
    await user.click(within(productCard as HTMLElement).getByRole('button', { name: /^comprar$/i }))

    expect(await screen.findByText(/adicionado ao carrinho/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /carrinho \(1\)/i }))

    expect(await screen.findByRole('heading', { name: /^carrinho$/i })).toBeInTheDocument()
    expect(screen.getByText(/submariner date/i)).toBeInTheDocument()
  })

  it('finaliza compra, abate saldo e volta ao banco com valor atualizado', async () => {
    const user = userEvent.setup()
    await registerAndOpenShop(user)

    const initialBalance = 500_000
    await user.click(screen.getByRole('button', { name: /relógios/i }))
    await user.click(await screen.findByRole('button', { name: /omega/i }))

    const productCard = (await screen.findByText(/speedmaster moonwatch/i)).closest('.product-card')
    await user.click(within(productCard as HTMLElement).getByRole('button', { name: /^comprar$/i }))
    await user.click(screen.getByRole('button', { name: /carrinho \(1\)/i }))

    const price = 42_000
    expect(expectMoneyText(price)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /finalizar compra/i }))
    expect(await screen.findByText(/compra concluída/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /ver saldo atualizado/i }))
    expect(await screen.findByText(/saldo disponível/i)).toBeInTheDocument()
    expect(expectMoneyText(initialBalance - price)).toBeInTheDocument()
  })

  it('permite voltar da loja até o banco', async () => {
    const user = userEvent.setup()
    await registerAndOpenShop(user)

    await user.click(screen.getByRole('button', { name: /móveis/i }))
    await user.click(await screen.findByRole('button', { name: /studio form/i }))
    await user.click(screen.getByRole('button', { name: /voltar às lojas/i }))
    expect(await screen.findByRole('heading', { name: /^móveis$/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /voltar às categorias/i }))
    expect(await screen.findByRole('heading', { name: /loja bank shop/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /voltar ao banco/i }))
    expect(await screen.findByText(/saldo disponível/i)).toBeInTheDocument()
  })

  it('bloqueia compra sem saldo suficiente', async () => {
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

    const productCard = (await screen.findByText(/submariner date/i)).closest('.product-card')
    await user.click(within(productCard as HTMLElement).getByRole('button', { name: /^comprar$/i }))
    await user.click(screen.getByRole('button', { name: /carrinho \(1\)/i }))
    await user.click(screen.getByRole('button', { name: /finalizar compra/i }))

    expect(await screen.findByText(/saldo insuficiente/i)).toBeInTheDocument()
  })
})
