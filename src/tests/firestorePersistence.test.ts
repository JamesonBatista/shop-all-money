import { beforeEach, describe, expect, it, vi } from 'vitest'
import './mocks/firebase'
import * as firestore from 'firebase/firestore'
import { createUser } from '../firebase/users'
import {
  getPersistenceStatus,
  markPersistenceDenied,
  markPersistenceOnline,
} from '../firebase/persistence'
import type { UserAccount } from '../types'

describe('persistência Firestore de cadastros', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(firestore.setDoc).mockReset()
    vi.mocked(firestore.setDoc).mockResolvedValue(undefined)
  })

  it('grava usuário no Firestore ao cadastrar', async () => {
    const user: UserAccount = {
      id: 'u-1',
      fullName: 'Ana Silva',
      email: 'ana@bankshop.test',
      password: 'senha123',
      cardOperator: 'Visa',
      balance: 1000,
      accountNumber: '123456',
      agency: '0001',
      createdAt: new Date().toISOString(),
    }

    await createUser(user)

    expect(firestore.setDoc).toHaveBeenCalled()
    expect(getPersistenceStatus()).toBe('online')
    const local = JSON.parse(localStorage.getItem('bankshop_users') || '[]') as UserAccount[]
    expect(local.some((u) => u.email === 'ana@bankshop.test')).toBe(true)
  })

  it('mantém cadastro local se Firestore negar permissão', async () => {
    vi.mocked(firestore.setDoc).mockRejectedValueOnce(
      new Error('7 PERMISSION_DENIED: Missing or insufficient permissions.'),
    )

    const user: UserAccount = {
      id: 'u-2',
      fullName: 'Bruno Costa',
      email: 'bruno@bankshop.test',
      password: 'senha123',
      cardOperator: 'Mastercard',
      balance: 2000,
      accountNumber: '654321',
      agency: '0001',
      createdAt: new Date().toISOString(),
    }

    await createUser(user)

    expect(getPersistenceStatus()).toBe('denied')
    const local = JSON.parse(localStorage.getItem('bankshop_users') || '[]') as UserAccount[]
    expect(local.some((u) => u.email === 'bruno@bankshop.test')).toBe(true)
  })

  it('marca status online/denied corretamente', () => {
    markPersistenceOnline()
    expect(getPersistenceStatus()).toBe('online')
    markPersistenceDenied(new Error('permission-denied'))
    expect(getPersistenceStatus()).toBe('denied')
  })
})
