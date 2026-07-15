import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import './mocks/firebase'
import { createUser } from '../firebase/users'
import type { UserAccount } from '../types'
import { expectMoneyText, setCurrencyDigits } from './helpers'
import { renderApp } from './test-utils'

vi.mock('../services/emailService', () => ({
  sendPurchaseEmail: vi.fn().mockResolvedValue('sent'),
  buildPurchaseEmailHtml: vi.fn().mockReturnValue('<html></html>'),
}))

async function registerUser(
  user: ReturnType<typeof userEvent.setup>,
  data: { name: string; email: string; digits: string },
) {
  renderApp(['/registro'])
  await screen.findByTestId('register-form')
  await user.type(screen.getByLabelText(/nome completo/i), data.name)
  await user.type(screen.getByLabelText(/^e-mail$/i), data.email)
  await user.type(screen.getByLabelText(/^senha$/i), 'senha123')
  await user.selectOptions(screen.getByLabelText(/cartão de crédito/i), 'Visa')
  await screen.findByLabelText(/valor em crédito/i)
  setCurrencyDigits(/valor em crédito/i, data.digits)
  await user.click(screen.getByRole('button', { name: /registrar e acessar/i }))
  expect(await screen.findByText(/saldo disponível/i)).toBeInTheDocument()
}

describe('UI bancária — pontos pedidos', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('remove Loja/Carrinho do header e mantém apenas Sair', async () => {
    const user = userEvent.setup()
    await registerUser(user, { name: 'Ana Silva', email: 'ana-ui@test.com', digits: '100000' })
    const header = screen.getByText('Bank').closest('.bank-top')
    expect(header).toBeTruthy()
    expect(within(header as HTMLElement).queryByRole('button', { name: /^loja$/i })).toBeNull()
    expect(within(header as HTMLElement).queryByRole('button', { name: /carrinho/i })).toBeNull()
    expect(within(header as HTMLElement).getByRole('button', { name: /^sair$/i })).toBeInTheDocument()
  })

  it('desabilita botões não pedidos (gray)', async () => {
    const user = userEvent.setup()
    await registerUser(user, { name: 'Bruno Silva', email: 'bruno-ui@test.com', digits: '100000' })
    expect(screen.getByRole('button', { name: /pagar/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /empréstimos/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /atendimento/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /área pix/i })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: /transferir/i })).not.toBeDisabled()
  })

  it('transfere para conta existente e falha sem alterar saldo se conta não existe', async () => {
    const user = userEvent.setup()
    await registerUser(user, {
      name: 'Carla Dias',
      email: 'carla-ui@test.com',
      digits: '500000', // 5000
    })
    const myAccount = screen.getByTestId('account-number').textContent!

    const peer: UserAccount = {
      id: crypto.randomUUID(),
      fullName: 'Peer Conta',
      email: 'peer-ui@test.com',
      password: 'senha123',
      cardOperator: 'Elo',
      balance: 100,
      accountNumber: '10489-171',
      agency: '4321',
      createdAt: new Date().toISOString(),
    }
    await createUser(peer)

    await user.click(screen.getByRole('button', { name: /transferir/i }))
    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByLabelText(/número da conta/i), '10489-171')
    fireEvent.change(within(dialog).getByLabelText(/^valor$/i), { target: { value: '150000' } })
    await user.click(within(dialog).getByRole('button', { name: /confirmar transferência/i }))
    expect(await screen.findByText(/transferência.*concluída/i)).toBeInTheDocument()
    expect(expectMoneyText(3500)).toBeInTheDocument()

    // close and reopen transfer for missing account
    await user.click(within(dialog).getByRole('button', { name: /fechar/i }))
    await user.click(screen.getByRole('button', { name: /transferir/i }))
    const dialog2 = await screen.findByRole('dialog')
    await user.type(within(dialog2).getByLabelText(/número da conta/i), '00000-000')
    fireEvent.change(within(dialog2).getByLabelText(/^valor$/i), { target: { value: '10000' } })
    await user.click(within(dialog2).getByRole('button', { name: /confirmar transferência/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/conta não encontrada/i)
    expect(expectMoneyText(3500)).toBeInTheDocument()
    expect(myAccount).toBeTruthy()
  })

  it('área Pix cria chave e confirma transferência com dados do destinatário', async () => {
    const user = userEvent.setup()
    await registerUser(user, {
      name: 'Diego Pix',
      email: 'diego-pix@test.com',
      digits: '800000',
    })

    const peer: UserAccount = {
      id: crypto.randomUUID(),
      fullName: 'Destinataria Pix',
      email: 'dest-pix@test.com',
      password: 'senha123',
      cardOperator: 'Visa',
      balance: 50,
      accountNumber: '12121-121',
      agency: '1111',
      createdAt: new Date().toISOString(),
    }
    await createUser(peer)

    // create key for peer via service-equivalent UI would need peer login;
    // seed key through API used by panel:
    const { createPixKeyForUser } = await import('../services/bankingOps')
    await createPixKeyForUser({ user: peer, type: 'email' })

    await user.click(screen.getByRole('button', { name: /área pix/i }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /criar chave pix/i }))
    await user.click(within(dialog).getByRole('button', { name: /salvar chave/i }))
    expect(await within(dialog).findByText(/chave pix criada/i)).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: /transferir por chave/i }))
    await user.type(within(dialog).getByLabelText(/chave pix do destinatário/i), 'dest-pix@test.com')
    fireEvent.change(within(dialog).getByLabelText(/^valor$/i), { target: { value: '200000' } })
    await user.click(within(dialog).getByRole('button', { name: /^continuar$/i }))

    const confirm = await screen.findByTestId('pix-confirm')
    expect(confirm).toHaveTextContent(/Destinataria Pix/)
    expect(confirm).toHaveTextContent(/12121-121/)
    await user.click(within(dialog).getByRole('button', { name: /confirmar transferência/i }))
    expect(await screen.findByText(/pix de .* realizado/i)).toBeInTheDocument()
  })

  it('investir abate saldo e aparece no extrato', async () => {
    const user = userEvent.setup()
    await registerUser(user, {
      name: 'Eva Invest',
      email: 'eva-invest@test.com',
      digits: '1000000', // 10000
    })

    await user.click(screen.getByRole('button', { name: /investir/i }))
    const dialog = await screen.findByRole('dialog')
    fireEvent.change(within(dialog).getByLabelText(/valor a investir/i), {
      target: { value: '400000' },
    })
    await user.click(within(dialog).getByRole('button', { name: /confirmar investimento/i }))
    expect(await screen.findByText(/investimento .* realizado/i)).toBeInTheDocument()
    expect(expectMoneyText(6000)).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: /fechar/i }))
    await user.click(screen.getByRole('button', { name: /extrato/i }))
    const extract = await screen.findByTestId('statement-list')
    expect(extract).toHaveTextContent(/aplicação/i)
  })
})
