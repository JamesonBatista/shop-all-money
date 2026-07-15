import { vi } from 'vitest'

vi.mock('../../firebase/config', () => ({
  firebaseApp: {},
  db: {},
}))

vi.mock('../../firebase/bootstrap', () => ({
  runSilentBankBootstrap: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  initializeApp: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn((...args: unknown[]) => ({ path: args.slice(1).join('/') })),
  getDoc: vi.fn().mockResolvedValue({ exists: () => false, data: () => null }),
  getDocs: vi.fn().mockResolvedValue({ empty: true, docs: [], size: 0 }),
  setDoc: vi.fn().mockResolvedValue(undefined),
  updateDoc: vi.fn().mockResolvedValue(undefined),
  deleteDoc: vi.fn().mockResolvedValue(undefined),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  increment: vi.fn((n: number) => ({ __increment: n })),
}))
