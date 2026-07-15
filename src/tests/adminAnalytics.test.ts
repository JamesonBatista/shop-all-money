import { beforeEach, describe, expect, it, vi } from 'vitest'
import './mocks/firebase'
import * as firestore from 'firebase/firestore'
import {
  ADMIN_CREDENTIALS,
  clearAdminSession,
  fetchAdminMetrics,
  getAnalyticsSnapshot,
  hasAdminSession,
  isAdminCredentials,
  saveAdminSession,
  trackInvest,
  trackPix,
  trackPurchase,
  trackRegister,
  trackTransfer,
  trackVisit,
} from '../firebase/analytics'

describe('admin analytics', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.mocked(firestore.setDoc).mockClear()
    vi.mocked(firestore.updateDoc).mockClear()
    vi.mocked(firestore.setDoc).mockResolvedValue(undefined)
    vi.mocked(firestore.updateDoc).mockResolvedValue(undefined)
    vi.mocked(firestore.getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({
        totalVisits: 0,
        uniqueVisitors: 0,
        registrations: 0,
        purchases: 0,
        purchaseVolume: 0,
        transfers: 0,
        pixTransfers: 0,
        investments: 0,
        lastVisitAt: null,
      }),
    } as never)
  })

  it('reconhece credenciais do painel', () => {
    expect(isAdminCredentials(ADMIN_CREDENTIALS.username, ADMIN_CREDENTIALS.password)).toBe(true)
    expect(isAdminCredentials('wrong', 'satorogojo')).toBe(false)
  })

  it('mantém sessão admin em sessionStorage', () => {
    expect(hasAdminSession()).toBe(false)
    saveAdminSession()
    expect(hasAdminSession()).toBe(true)
    clearAdminSession()
    expect(hasAdminSession()).toBe(false)
  })

  it('acumula visitas, cadastros e atividade financeira', async () => {
    await trackVisit()
    await trackVisit()
    await trackRegister('Ana Silva')
    await trackPurchase(15000, 'Patek Philippe')
    await trackTransfer()
    await trackPix()
    await trackInvest(5000, 'CDB Premium')

    const snapshot = getAnalyticsSnapshot()
    expect(snapshot.totalVisits).toBe(2)
    expect(snapshot.uniqueVisitors).toBe(1)
    expect(snapshot.registrations).toBeGreaterThanOrEqual(1)
    expect(snapshot.purchases).toBeGreaterThanOrEqual(1)
    expect(snapshot.purchaseVolume).toBeGreaterThanOrEqual(15000)
    expect(snapshot.transfers).toBe(1)
    expect(snapshot.pixTransfers).toBe(1)
    expect(snapshot.investments).toBe(1)
    expect(snapshot.events.length).toBeGreaterThanOrEqual(6)
  })

  it('tenta espelhar métricas no Firestore (analytics + events)', async () => {
    await trackRegister('Bruno Costa')
    expect(firestore.setDoc).toHaveBeenCalled()
    expect(firestore.updateDoc).toHaveBeenCalled()
  })

  it('fetchAdminMetrics devolve source e status de persistência', async () => {
    await trackVisit()
    const metrics = await fetchAdminMetrics()
    expect(metrics.source === 'firestore' || metrics.source === 'local').toBe(true)
    expect(['unknown', 'online', 'denied', 'offline']).toContain(metrics.firestoreStatus)
    expect(metrics.totalVisits).toBeGreaterThanOrEqual(1)
  })
})
