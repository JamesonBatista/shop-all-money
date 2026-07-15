import { doc, setDoc } from 'firebase/firestore'
import type { PurchaseRecord } from '../types'
import { db } from './config'

const PURCHASES = 'purchases'
const LOCAL_KEY = 'bankshop_purchases'

export async function savePurchase(purchase: PurchaseRecord): Promise<void> {
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]') as PurchaseRecord[]
    localStorage.setItem(LOCAL_KEY, JSON.stringify([purchase, ...existing]))
  } catch {
    // ignore local errors
  }

  try {
    await setDoc(doc(db, PURCHASES, purchase.id), purchase)
  } catch {
    // Firestore optional
  }
}
