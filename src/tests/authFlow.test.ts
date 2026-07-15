import { beforeEach, describe, expect, it } from 'vitest'
import { createUser, findUserByEmail, updateUserBalance } from '../firebase/users'
import type { UserAccount } from '../types'
import { MAX_BALANCE } from '../types'
import { canDeposit, validateBalance } from '../utils/currency'

function makeUser(overrides: Partial<UserAccount> = {}): UserAccount {
  return {
    id: crypto.randomUUID(),
    fullName: 'Jameson Batista',
    email: `user-${Math.random().toString(16).slice(2)}@bankshop.test`,
    password: 'secret1',
    cardOperator: 'Visa',
    balance: 50_000,
    accountNumber: '12345-678',
    agency: '1234',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('auth and balance flow', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('registers and finds user by email', async () => {
    const user = makeUser()
    await createUser(user)
    const found = await findUserByEmail(user.email)
    expect(found?.fullName).toBe('Jameson Batista')
    expect(found?.balance).toBe(50_000)
  })

  it('prevents duplicate email locally', async () => {
    const user = makeUser({ email: 'dup@bankshop.test' })
    await createUser(user)
    await expect(createUser({ ...user, id: crypto.randomUUID() })).rejects.toThrow(/já está cadastrado/i)
  })

  it('updates balance after purchase-like debit', async () => {
    const user = makeUser({ balance: 10_000 })
    await createUser(user)
    await updateUserBalance(user.id, 7_500)
    const found = await findUserByEmail(user.email)
    expect(found?.balance).toBe(7_500)
  })

  it('blocks registration credit above 100 million', () => {
    expect(validateBalance(MAX_BALANCE + 0.01).ok).toBe(false)
  })

  it('blocks deposit that would exceed 100 million', () => {
    expect(canDeposit(MAX_BALANCE - 100, 200).ok).toBe(false)
  })
})
