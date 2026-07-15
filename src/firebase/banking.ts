import { doc, setDoc } from 'firebase/firestore'
import type {
  InvestmentPosition,
  LedgerEntry,
  PixKey,
  PurchaseRecord,
} from '../types'
import { MAX_PIX_HISTORY } from '../types'
import { db } from './config'
import { readJson, writeJson } from './storageLocal'

const PIX_KEYS = 'bankshop_pix_keys'
const LEDGER = 'bankshop_ledger'
const INVESTMENTS = 'bankshop_investments'
const PURCHASES = 'bankshop_purchases'

async function mirrorDoc(collectionName: string, id: string, data: unknown) {
  try {
    await setDoc(doc(db, collectionName, id), data as Record<string, unknown>)
  } catch {
    // local-first
  }
}

export function listPixKeys(userId: string): PixKey[] {
  return readJson<PixKey[]>(PIX_KEYS, []).filter((k) => k.userId === userId)
}

export function findPixKey(key: string): PixKey | null {
  const normalized = key.trim().toLowerCase()
  return (
    readJson<PixKey[]>(PIX_KEYS, []).find((k) => k.key.toLowerCase() === normalized) ?? null
  )
}

export async function savePixKey(pixKey: PixKey): Promise<PixKey> {
  const all = readJson<PixKey[]>(PIX_KEYS, [])
  if (all.some((k) => k.key.toLowerCase() === pixKey.key.toLowerCase())) {
    throw new Error('Esta chave Pix já está em uso.')
  }
  writeJson(PIX_KEYS, [pixKey, ...all])
  await mirrorDoc('pix_keys', pixKey.id, pixKey)
  return pixKey
}

export function listLedger(userId: string): LedgerEntry[] {
  return readJson<LedgerEntry[]>(LEDGER, [])
    .filter((e) => e.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function listPixLedger(userId: string): LedgerEntry[] {
  return listLedger(userId)
    .filter((e) => e.kind === 'pix_out' || e.kind === 'pix_in' || e.kind === 'transfer_out' || e.kind === 'transfer_in')
    .slice(0, MAX_PIX_HISTORY)
}

export async function appendLedger(entry: LedgerEntry): Promise<void> {
  const all = readJson<LedgerEntry[]>(LEDGER, [])
  const next = [entry, ...all]

  // Cap PIX-related history per user at MAX_PIX_HISTORY (overwrite oldest)
  const pixKinds = new Set(['pix_out', 'pix_in', 'transfer_out', 'transfer_in'])
  if (pixKinds.has(entry.kind)) {
    const userPix = next.filter((e) => e.userId === entry.userId && pixKinds.has(e.kind))
    if (userPix.length > MAX_PIX_HISTORY) {
      const keepIds = new Set(userPix.slice(0, MAX_PIX_HISTORY).map((e) => e.id))
      const trimmed = next.filter(
        (e) => !(e.userId === entry.userId && pixKinds.has(e.kind)) || keepIds.has(e.id),
      )
      writeJson(LEDGER, trimmed)
      await mirrorDoc('ledger', entry.id, entry)
      return
    }
  }

  writeJson(LEDGER, next)
  await mirrorDoc('ledger', entry.id, entry)
}

export function listInvestments(userId: string): InvestmentPosition[] {
  return readJson<InvestmentPosition[]>(INVESTMENTS, []).filter((i) => i.userId === userId)
}

export async function saveInvestment(position: InvestmentPosition): Promise<void> {
  const all = readJson<InvestmentPosition[]>(INVESTMENTS, [])
  const idx = all.findIndex((i) => i.id === position.id)
  if (idx >= 0) all[idx] = position
  else all.unshift(position)
  writeJson(INVESTMENTS, all)
  await mirrorDoc('investments', position.id, position)
}

export async function updateInvestment(position: InvestmentPosition): Promise<void> {
  await saveInvestment(position)
}

export function listPurchases(userId: string): PurchaseRecord[] {
  return readJson<PurchaseRecord[]>(PURCHASES, [])
    .filter((p) => p.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
