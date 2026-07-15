import { beforeEach, describe, expect, it, vi } from 'vitest'

const setDoc = vi.fn().mockResolvedValue(undefined)
const getDoc = vi.fn().mockResolvedValue({ exists: () => false, data: () => null })
const getDocs = vi.fn().mockResolvedValue({ docs: [] })
const updateDoc = vi.fn().mockResolvedValue(undefined)
const deleteDoc = vi.fn().mockResolvedValue(undefined)
const doc = vi.fn((...args: unknown[]) => ({ path: args.join('/') }))
const collection = vi.fn()

vi.mock('../firebase/config', () => ({
  db: {},
  firebaseApp: {},
}))

vi.mock('firebase/firestore', () => ({
  doc: (...args: unknown[]) => doc(...args),
  collection: (...args: unknown[]) => collection(...args),
  getDoc: (...args: unknown[]) => getDoc(...args),
  getDocs: (...args: unknown[]) => getDocs(...args),
  setDoc: (...args: unknown[]) => setDoc(...args),
  updateDoc: (...args: unknown[]) => updateDoc(...args),
  deleteDoc: (...args: unknown[]) => deleteDoc(...args),
}))

describe('bootstrap silencioso', () => {
  beforeEach(() => {
    localStorage.clear()
    setDoc.mockClear()
    getDoc.mockClear()
  })

  it('executa create/update de metadados do banco', async () => {
    const { runSilentBankBootstrap } = await import('../firebase/bootstrap')
    await runSilentBankBootstrap()
    expect(setDoc).toHaveBeenCalled()
  })

  it('usa fallback local quando Firestore falha', async () => {
    getDoc.mockRejectedValueOnce(new Error('offline'))
    const { runSilentBankBootstrap } = await import('../firebase/bootstrap')
    await runSilentBankBootstrap()
    expect(localStorage.getItem('bankshop_bootstrap')).toBeTruthy()
  })
})
