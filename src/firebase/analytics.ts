import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import type { LedgerEntry } from '../types'
import { listPurchases } from './banking'
import { db } from './config'
import {
  getPersistenceError,
  getPersistenceStatus,
  withFirestore,
} from './persistence'
import { readJson, writeJson } from './storageLocal'
import { listLocalUsers, listRemoteUsers } from './users'

const ANALYTICS_KEY = 'bankshop_analytics'
const VISITOR_KEY = 'bankshop_visitor_id'
const LEDGER_KEY = 'bankshop_ledger'
const ANALYTICS_DOC = doc(db, 'analytics', 'app')
const EVENTS = 'analytics_events'

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

export interface AdminMetrics extends AnalyticsSnapshot {
  liveUsers: number
  livePurchases: number
  liveLedgerCount: number
  firestoreStatus: ReturnType<typeof getPersistenceStatus>
  firestoreError: string
  source: 'firestore' | 'local'
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

function readLocal(): AnalyticsSnapshot {
  return readJson<AnalyticsSnapshot>(ANALYTICS_KEY, defaultSnapshot())
}

function writeLocal(snapshot: AnalyticsSnapshot) {
  snapshot.events = snapshot.events.slice(0, 100)
  writeJson(ANALYTICS_KEY, snapshot)
}

function pushEvent(snapshot: AnalyticsSnapshot, event: Omit<AnalyticsEvent, 'id'> & { id?: string }) {
  const full: AnalyticsEvent = { ...event, id: event.id ?? crypto.randomUUID() }
  snapshot.events.unshift(full)
  return full
}

function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(VISITOR_KEY, id)
  }
  return id
}

async function ensureAnalyticsDoc() {
  const snap = await getDoc(ANALYTICS_DOC)
  if (!snap.exists()) {
    await setDoc(ANALYTICS_DOC, {
      ...defaultSnapshot(),
      visitorIds: [],
      events: [],
      updatedAt: new Date().toISOString(),
    })
  }
}

async function syncEventToFirestore(
  event: AnalyticsEvent,
  counters: Record<string, unknown>,
) {
  return withFirestore(async () => {
    await ensureAnalyticsDoc()
    await setDoc(doc(db, EVENTS, event.id), event)
    await updateDoc(ANALYTICS_DOC, {
      ...counters,
      updatedAt: new Date().toISOString(),
    })
    return true
  })
}

export async function trackVisit(): Promise<void> {
  const snapshot = readLocal()
  const visitorId = getVisitorId()
  snapshot.totalVisits += 1
  snapshot.lastVisitAt = new Date().toISOString()
  let isNewVisitor = false
  if (!snapshot.visitorIds.includes(visitorId)) {
    snapshot.visitorIds.push(visitorId)
    snapshot.uniqueVisitors = snapshot.visitorIds.length
    isNewVisitor = true
  }
  const event = pushEvent(snapshot, { type: 'visit', at: snapshot.lastVisitAt })
  writeLocal(snapshot)

  await syncEventToFirestore(event, {
    totalVisits: increment(1),
    ...(isNewVisitor ? { uniqueVisitors: increment(1) } : {}),
    lastVisitAt: snapshot.lastVisitAt,
  })
}

export async function trackRegister(fullName: string): Promise<void> {
  const snapshot = readLocal()
  snapshot.registrations += 1
  const event = pushEvent(snapshot, {
    type: 'register',
    at: new Date().toISOString(),
    label: fullName,
  })
  writeLocal(snapshot)

  await syncEventToFirestore(event, {
    registrations: increment(1),
  })
}

export async function trackPurchase(total: number, storeName: string): Promise<void> {
  const snapshot = readLocal()
  snapshot.purchases += 1
  snapshot.purchaseVolume += total
  const event = pushEvent(snapshot, {
    type: 'purchase',
    at: new Date().toISOString(),
    label: storeName,
    meta: { total },
  })
  writeLocal(snapshot)

  await syncEventToFirestore(event, {
    purchases: increment(1),
    purchaseVolume: increment(total),
  })
}

export async function trackTransfer(): Promise<void> {
  const snapshot = readLocal()
  snapshot.transfers += 1
  const event = pushEvent(snapshot, { type: 'transfer', at: new Date().toISOString() })
  writeLocal(snapshot)
  await syncEventToFirestore(event, { transfers: increment(1) })
}

export async function trackPix(): Promise<void> {
  const snapshot = readLocal()
  snapshot.pixTransfers += 1
  const event = pushEvent(snapshot, { type: 'pix', at: new Date().toISOString() })
  writeLocal(snapshot)
  await syncEventToFirestore(event, { pixTransfers: increment(1) })
}

export async function trackInvest(amount: number, optionName: string): Promise<void> {
  const snapshot = readLocal()
  snapshot.investments += 1
  const event = pushEvent(snapshot, {
    type: 'invest',
    at: new Date().toISOString(),
    label: optionName,
    meta: { amount },
  })
  writeLocal(snapshot)
  await syncEventToFirestore(event, { investments: increment(1) })
}

/** Synchronous local snapshot (tests + instant paint). */
export function getAnalyticsSnapshot(): AdminMetrics {
  const snapshot = readLocal()
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
    firestoreStatus: getPersistenceStatus(),
    firestoreError: getPersistenceError(),
    source: 'local',
  }
}

/** Admin: load global metrics from Firestore (all browsers / all users). */
export async function fetchAdminMetrics(): Promise<AdminMetrics> {
  const local = getAnalyticsSnapshot()

  const remote = await withFirestore(async () => {
    await ensureAnalyticsDoc()
    const [aggSnap, eventsSnap, users] = await Promise.all([
      getDoc(ANALYTICS_DOC),
      getDocs(query(collection(db, EVENTS), orderBy('at', 'desc'), limit(40))),
      listRemoteUsers(),
    ])

    const agg = (aggSnap.data() ?? {}) as Partial<AnalyticsSnapshot>
    const events = eventsSnap.docs.map((d) => d.data() as AnalyticsEvent)
    const purchases = users.flatMap((u) => listPurchases(u.id))
    const ledger = readJson<LedgerEntry[]>(LEDGER_KEY, [])

    return {
      totalVisits: Math.max(Number(agg.totalVisits ?? 0), local.totalVisits),
      uniqueVisitors: Math.max(Number(agg.uniqueVisitors ?? 0), local.uniqueVisitors),
      visitorIds: Array.isArray(agg.visitorIds) ? agg.visitorIds : local.visitorIds,
      registrations: Math.max(Number(agg.registrations ?? 0), users.length, local.registrations),
      purchases: Math.max(Number(agg.purchases ?? 0), purchases.length, local.purchases),
      purchaseVolume: Math.max(Number(agg.purchaseVolume ?? 0), local.purchaseVolume),
      transfers: Math.max(Number(agg.transfers ?? 0), local.transfers),
      pixTransfers: Math.max(Number(agg.pixTransfers ?? 0), local.pixTransfers),
      investments: Math.max(Number(agg.investments ?? 0), local.investments),
      lastVisitAt: (agg.lastVisitAt as string | null) ?? local.lastVisitAt,
      events: events.length ? events : local.events,
      liveUsers: Math.max(users.length, local.liveUsers),
      livePurchases: Math.max(purchases.length, local.livePurchases),
      liveLedgerCount: ledger.length,
      firestoreStatus: 'online' as const,
      firestoreError: '',
      source: 'firestore' as const,
    }
  })

  if (remote) return remote

  return {
    ...local,
    firestoreStatus: getPersistenceStatus(),
    firestoreError: getPersistenceError(),
    source: 'local',
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
