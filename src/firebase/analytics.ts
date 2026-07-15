import { doc, setDoc } from 'firebase/firestore'
import type { LedgerEntry } from '../types'
import { listPurchases } from './banking'
import { db } from './config'
import { readJson, writeJson } from './storageLocal'
import { listLocalUsers } from './users'

const ANALYTICS_KEY = 'bankshop_analytics'
const VISITOR_KEY = 'bankshop_visitor_id'
const LEDGER_KEY = 'bankshop_ledger'

export interface AnalyticsSnapshot {
  totalVisits: number
  uniqueVisitors: number
  visitorIds: string[]
  registrations: number
  purchases: number
  purchaseVolume: number
  transfers: number
  pixTransfers: number
  investments: number
  lastVisitAt: string | null
  events: AnalyticsEvent[]
}

export interface AnalyticsEvent {
  id: string
  type: 'visit' | 'register' | 'purchase' | 'transfer' | 'pix' | 'invest' | 'login'
  at: string
  label?: string
  meta?: Record<string, string | number>
}

function defaultSnapshot(): AnalyticsSnapshot {
  return {
    totalVisits: 0,
    uniqueVisitors: 0,
    visitorIds: [],
    registrations: 0,
    purchases: 0,
    purchaseVolume: 0,
    transfers: 0,
    pixTransfers: 0,
    investments: 0,
    lastVisitAt: null,
    events: [],
  }
}

function read(): AnalyticsSnapshot {
  return readJson<AnalyticsSnapshot>(ANALYTICS_KEY, defaultSnapshot())
}

async function write(snapshot: AnalyticsSnapshot) {
  snapshot.events = snapshot.events.slice(0, 100)
  writeJson(ANALYTICS_KEY, snapshot)
  try {
    await setDoc(doc(db, 'analytics', 'app'), {
      ...snapshot,
      updatedAt: new Date().toISOString(),
    })
  } catch {
    // local-first
  }
}

function pushEvent(snapshot: AnalyticsSnapshot, event: Omit<AnalyticsEvent, 'id'>) {
  snapshot.events.unshift({ ...event, id: crypto.randomUUID() })
}

function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(VISITOR_KEY, id)
  }
  return id
}

export async function trackVisit(): Promise<void> {
  const snapshot = read()
  const visitorId = getVisitorId()
  snapshot.totalVisits += 1
  snapshot.lastVisitAt = new Date().toISOString()
  if (!snapshot.visitorIds.includes(visitorId)) {
    snapshot.visitorIds.push(visitorId)
    snapshot.uniqueVisitors = snapshot.visitorIds.length
  }
  pushEvent(snapshot, { type: 'visit', at: snapshot.lastVisitAt })
  await write(snapshot)
}

export async function trackRegister(fullName: string): Promise<void> {
  const snapshot = read()
  snapshot.registrations += 1
  pushEvent(snapshot, {
    type: 'register',
    at: new Date().toISOString(),
    label: fullName,
  })
  await write(snapshot)
}

export async function trackPurchase(total: number, storeName: string): Promise<void> {
  const snapshot = read()
  snapshot.purchases += 1
  snapshot.purchaseVolume += total
  pushEvent(snapshot, {
    type: 'purchase',
    at: new Date().toISOString(),
    label: storeName,
    meta: { total },
  })
  await write(snapshot)
}

export async function trackTransfer(): Promise<void> {
  const snapshot = read()
  snapshot.transfers += 1
  pushEvent(snapshot, { type: 'transfer', at: new Date().toISOString() })
  await write(snapshot)
}

export async function trackPix(): Promise<void> {
  const snapshot = read()
  snapshot.pixTransfers += 1
  pushEvent(snapshot, { type: 'pix', at: new Date().toISOString() })
  await write(snapshot)
}

export async function trackInvest(amount: number, optionName: string): Promise<void> {
  const snapshot = read()
  snapshot.investments += 1
  pushEvent(snapshot, {
    type: 'invest',
    at: new Date().toISOString(),
    label: optionName,
    meta: { amount },
  })
  await write(snapshot)
}

export function getAnalyticsSnapshot(): AnalyticsSnapshot & {
  liveUsers: number
  livePurchases: number
  liveLedgerCount: number
} {
  const snapshot = read()
  const users = listLocalUsers()
  const purchases = users.flatMap((u) => listPurchases(u.id))
  const ledger = readJson<LedgerEntry[]>(LEDGER_KEY, [])
  return {
    ...snapshot,
    registrations: Math.max(snapshot.registrations, users.length),
    purchases: Math.max(snapshot.purchases, purchases.length),
    liveUsers: users.length,
    livePurchases: purchases.length,
    liveLedgerCount: ledger.length,
  }
}

export const ADMIN_CREDENTIALS = {
  username: 'jambatista',
  password: 'satorogojo',
} as const

export function isAdminCredentials(username: string, password: string): boolean {
  return (
    username.trim().toLowerCase() === ADMIN_CREDENTIALS.username &&
    password === ADMIN_CREDENTIALS.password
  )
}

const ADMIN_SESSION = 'bankshop_admin_session'

export function saveAdminSession() {
  sessionStorage.setItem(ADMIN_SESSION, '1')
}

export function clearAdminSession() {
  sessionStorage.removeItem(ADMIN_SESSION)
}

export function hasAdminSession(): boolean {
  return sessionStorage.getItem(ADMIN_SESSION) === '1'
}
