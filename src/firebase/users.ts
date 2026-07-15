import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import type { UserAccount } from '../types'
import { db } from './config'
import { withFirestore } from './persistence'

const USERS = 'users'
const LOCAL_USERS_KEY = 'bankshop_users'
const SESSION_KEY = 'bankshop_session'

function readLocalUsers(): UserAccount[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]') as UserAccount[]
  } catch {
    return []
  }
}

function writeLocalUsers(users: UserAccount[]) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users))
}

function upsertLocalUser(user: UserAccount) {
  const local = readLocalUsers()
  const idx = local.findIndex((u) => u.id === user.id)
  if (idx >= 0) local[idx] = user
  else local.push(user)
  writeLocalUsers(local)
}

export async function createUser(user: UserAccount): Promise<UserAccount> {
  const local = readLocalUsers()
  if (local.some((u) => u.email.toLowerCase() === user.email.toLowerCase())) {
    throw new Error('Este e-mail já está cadastrado.')
  }

  // Always keep a local copy for offline UX.
  writeLocalUsers([...local, user])

  const remote = await withFirestore(async () => {
    await setDoc(doc(db, USERS, user.id), {
      ...user,
      email: user.email.trim().toLowerCase(),
      syncedAt: new Date().toISOString(),
    })
    return true
  })

  if (!remote) {
    // Surface why admin metrics / console may be empty.
    console.error(
      '[Bank Shop] Cadastro salvo só no navegador. Firestore bloqueou a gravação (rules).',
    )
  }

  return user
}

export async function findUserByEmail(email: string): Promise<UserAccount | null> {
  const normalized = email.trim().toLowerCase()

  const remote = await withFirestore(async () => {
    const q = query(collection(db, USERS), where('email', '==', normalized))
    const snap = await getDocs(q)
    if (snap.empty) return null
    const user = snap.docs[0].data() as UserAccount
    upsertLocalUser(user)
    return user
  })

  if (remote) return remote
  return readLocalUsers().find((u) => u.email.toLowerCase() === normalized) ?? null
}

export async function getUserById(id: string): Promise<UserAccount | null> {
  const remote = await withFirestore(async () => {
    const snap = await getDoc(doc(db, USERS, id))
    if (!snap.exists()) return null
    const user = snap.data() as UserAccount
    upsertLocalUser(user)
    return user
  })

  if (remote) return remote
  return readLocalUsers().find((u) => u.id === id) ?? null
}

export async function findUserByAccountNumber(accountNumber: string): Promise<UserAccount | null> {
  const normalized = accountNumber.trim()
  const remote = await withFirestore(async () => {
    const q = query(collection(db, USERS), where('accountNumber', '==', normalized))
    const snap = await getDocs(q)
    if (snap.empty) return null
    const user = snap.docs[0].data() as UserAccount
    upsertLocalUser(user)
    return user
  })

  if (remote) return remote
  return readLocalUsers().find((u) => u.accountNumber === normalized) ?? null
}

export function listLocalUsers(): UserAccount[] {
  return readLocalUsers()
}

/** Loads every registered user from Firestore (for admin metrics). */
export async function listRemoteUsers(): Promise<UserAccount[]> {
  const remote = await withFirestore(async () => {
    const snap = await getDocs(collection(db, USERS))
    const users = snap.docs.map((d) => d.data() as UserAccount)
    // merge into local cache
    for (const user of users) upsertLocalUser(user)
    return users
  })
  return remote ?? readLocalUsers()
}

export async function updateUserBalance(userId: string, balance: number): Promise<void> {
  const local = readLocalUsers()
  const idx = local.findIndex((u) => u.id === userId)
  if (idx >= 0) {
    local[idx] = { ...local[idx], balance }
    writeLocalUsers(local)
  }

  await withFirestore(async () => {
    try {
      await updateDoc(doc(db, USERS, userId), { balance, updatedAt: new Date().toISOString() })
    } catch {
      const existing = local.find((u) => u.id === userId)
      if (existing) {
        await setDoc(doc(db, USERS, userId), {
          ...existing,
          balance,
          syncedAt: new Date().toISOString(),
        })
      }
    }
    return true
  })
}

export function saveSession(userId: string) {
  localStorage.setItem(SESSION_KEY, userId)
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

export function getSessionUserId(): string | null {
  return localStorage.getItem(SESSION_KEY)
}
