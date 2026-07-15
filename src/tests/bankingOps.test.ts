import { beforeEach, describe, expect, it } from 'vitest'
import './mocks/firebase'
import { createUser, getUserById, updateUserBalance } from '../firebase/users'
import {
  createPixKeyForUser,
  getUserPixHistory,
  getUserPurchases,
  getUserStatement,
  investAmount,
  lookupPixRecipient,
  processDailyYields,
  transferByAccount,
  transferByPixKey,
} from '../services/bankingOps'
import type { UserAccount } from '../types'
import { MAX_PIX_HISTORY, YIELD_INTERVAL_MS } from '../types'
import { savePurchase } from '../firebase/purchases'

function makeUser(partial: Partial<UserAccount> & Pick<UserAccount, 'email' | 'accountNumber'>): UserAccount {
  return {
    id: crypto.randomUUID(),
    fullName: partial.fullName || 'Usuario Teste',
    email: partial.email,
    password: 'senha123',
    cardOperator: 'Visa',
    balance: partial.balance ?? 100_000,
    accountNumber: partial.accountNumber,
    agency: partial.agency || '1234',
    createdAt: new Date().toISOString(),
    ...partial,
  }
}

describe('bankingOps', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('transfere entre contas existentes e registra histórico', async () => {
    const from = makeUser({
      fullName: 'Alice Souza',
      email: 'alice@test.com',
      accountNumber: '10489-171',
      balance: 10_000,
    })
    const to = makeUser({
      fullName: 'Bruno Lima',
      email: 'bruno@test.com',
      accountNumber: '22222-333',
      balance: 1_000,
    })
    await createUser(from)
    await createUser(to)

    await transferByAccount({ from, accountNumber: '22222-333', amount: 2_500 })
    const fromAfter = await getUserById(from.id)
    const toAfter = await getUserById(to.id)
    expect(fromAfter?.balance).toBe(7_500)
    expect(toAfter?.balance).toBe(3_500)

    const history = getUserPixHistory(from.id)
    expect(history[0]?.kind).toBe('transfer_out')
  })

  it('não altera saldo quando a conta destinária não existe', async () => {
    const from = makeUser({
      email: 'carla@test.com',
      accountNumber: '11111-111',
      balance: 5_000,
    })
    await createUser(from)
    await expect(
      transferByAccount({ from, accountNumber: '99999-999', amount: 100 }),
    ).rejects.toThrow(/conta não encontrada/i)

    const after = await getUserById(from.id)
    expect(after?.balance).toBe(5_000)
  })

  it('cria chave Pix e valida destinatário na transferência', async () => {
    const from = makeUser({
      fullName: 'Diego Alves',
      email: 'diego@test.com',
      accountNumber: '33333-333',
      balance: 8_000,
    })
    const to = makeUser({
      fullName: 'Eva Rocha',
      email: 'eva@test.com',
      accountNumber: '44444-444',
      balance: 500,
    })
    await createUser(from)
    await createUser(to)

    const key = await createPixKeyForUser({ user: to, type: 'email' })
    const looked = await lookupPixRecipient(key.key)
    expect(looked.user.fullName).toBe('Eva Rocha')

    await transferByPixKey({ from, key: key.key, amount: 1_200 })
    expect((await getUserById(from.id))?.balance).toBe(6_800)
    expect((await getUserById(to.id))?.balance).toBe(1_700)
  })

  it('rejeita chave Pix inexistente', async () => {
    await expect(lookupPixRecipient('nao-existe@pix.com')).rejects.toThrow(/não encontrada/i)
  })

  it('mantém no máximo 20 registros Pix por usuário (FIFO)', async () => {
    const from = makeUser({
      email: 'fifo@test.com',
      accountNumber: '55555-555',
      balance: 1_000_000,
    })
    await createUser(from)

    for (let i = 0; i < MAX_PIX_HISTORY + 5; i += 1) {
      const to = makeUser({
        email: `dest${i}@test.com`,
        accountNumber: `${60000 + i}-100`,
        balance: 0,
        fullName: `Dest ${i}`,
      })
      await createUser(to)
      const freshFrom = (await getUserById(from.id))!
      await transferByAccount({
        from: freshFrom,
        accountNumber: to.accountNumber,
        amount: 10,
      })
    }

    const history = getUserPixHistory(from.id)
    expect(history.length).toBe(MAX_PIX_HISTORY)
  })

  it('investe abatendo saldo e credita yield após 24h', async () => {
    const user = makeUser({
      email: 'invest@test.com',
      accountNumber: '77777-777',
      balance: 20_000,
    })
    await createUser(user)

    const position = await investAmount({
      user,
      optionId: 'cdb-bankshop',
      amount: 10_000,
    })
    expect((await getUserById(user.id))?.balance).toBe(10_000)

    const afterYield = await processDailyYields(
      user.id,
      new Date(position.lastYieldAt).getTime() + YIELD_INTERVAL_MS + 1000,
    )
    expect(afterYield).toBeCloseTo(50, 5) // 0.5% of 10000
    expect((await getUserById(user.id))?.balance).toBeCloseTo(10_050, 5)

    const statement = getUserStatement(user.id)
    expect(statement.some((e) => e.kind === 'yield')).toBe(true)
    expect(statement.some((e) => e.kind === 'invest')).toBe(true)
  })

  it('lista compras no histórico de cartões', async () => {
    const user = makeUser({
      email: 'shopper@test.com',
      accountNumber: '88888-888',
      balance: 50_000,
    })
    await createUser(user)
    await savePurchase({
      id: crypto.randomUUID(),
      userId: user.id,
      userEmail: user.email,
      items: [
        {
          productId: 'p1',
          name: 'Item',
          price: 100,
          image: 'https://example.com/a.jpg',
          storeId: 'rolex',
          storeName: 'Rolex',
          categoryId: 'relogios',
          quantity: 1,
        },
      ],
      total: 100,
      storeTheme: {
        primary: '#000',
        secondary: '#111',
        accent: '#fff',
        background: '#000',
        text: '#fff',
        surface: '#111',
        fontDisplay: 'serif',
      },
      storeName: 'Rolex',
      createdAt: new Date().toISOString(),
      emailStatus: 'sent',
    })

    const purchases = getUserPurchases(user.id)
    expect(purchases).toHaveLength(1)
    expect(purchases[0].storeName).toBe('Rolex')
  })

  it('não processa yield antes de 24h', async () => {
    const user = makeUser({
      email: 'early@test.com',
      accountNumber: '99999-001',
      balance: 5_000,
    })
    await createUser(user)
    const position = await investAmount({ user, optionId: 'renda-plus', amount: 1_000 })
    const credited = await processDailyYields(
      user.id,
      new Date(position.lastYieldAt).getTime() + 60_000,
    )
    expect(credited).toBe(0)
  })
})
