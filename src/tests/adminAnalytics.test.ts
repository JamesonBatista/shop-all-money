import { beforeEach, describe, expect, it } from 'vitest'
import {
  ADMIN_CREDENTIALS,
  clearAdminSession,
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
})
