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

export async function createUser(user: UserAccount): Promise<UserAccount> {
  const local = readLocalUsers()
  if (local.some((u) => u.email.toLowerCase() === user.email.toLowerCase())) {
    throw new Error('Este e-mail já está cadastrado.')
  }

  writeLocalUsers([...local, user])

  try {
    await setDoc(doc(db, USERS, user.id), user)
  } catch {
    // Firestore may be restricted; local persistence keeps the app usable.
  }

  return user
}

export async function findUserByEmail(email: string): Promise<UserAccount | null> {
  const normalized = email.trim().toLowerCase()

  try {
    const q = query(collection(db, USERS), where('email', '==', normalized))
    const snap = await getDocs(q)
    if (!snap.empty) {
      return snap.docs[0].data() as UserAccount
    }
  } catch {
    // fall through to local
  }

  return readLocalUsers().find((u) => u.email.toLowerCase() === normalized) ?? null
}

export async function getUserById(id: string): Promise<UserAccount | null> {
  try {
    const snap = await getDoc(doc(db, USERS, id))
    if (snap.exists()) return snap.data() as UserAccount
  } catch {
    // fall through
  }
  return readLocalUsers().find((u) => u.id === id) ?? null
}

export async function findUserByAccountNumber(accountNumber: string): Promise<UserAccount | null> {
  const normalized = accountNumber.trim()
  try {
    const q = query(collection(db, USERS), where('accountNumber', '==', normalized))
    const snap = await getDocs(q)
    if (!snap.empty) return snap.docs[0].data() as UserAccount
  } catch {
    // fall through
  }
  return readLocalUsers().find((u) => u.accountNumber === normalized) ?? null
}

export function listLocalUsers(): UserAccount[] {
  return readLocalUsers()
}

export async function updateUserBalance(userId: string, balance: number): Promise<void> {
  const local = readLocalUsers()
  const idx = local.findIndex((u) => u.id === userId)
  if (idx >= 0) {
    local[idx] = { ...local[idx], balance }
    writeLocalUsers(local)
  }

  try {
    await updateDoc(doc(db, USERS, userId), { balance })
  } catch {
    try {
      const existing = local.find((u) => u.id === userId)
      if (existing) await setDoc(doc(db, USERS, userId), existing)
    } catch {
      // keep local only
    }
  }
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
