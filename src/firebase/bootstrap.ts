import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { CATEGORIES } from '../data/categories'
import { PRODUCTS } from '../data/products'
import { STORES } from '../data/stores'
import type { BankBootstrap } from '../types'
import { MAX_BALANCE } from '../types'
import { db } from './config'

const BOOTSTRAP_ID = 'bank-shop-core'
const META = 'meta'
const CATALOG = 'catalog'

/**
 * Hidden CRUD executed on app start — seeds/updates bank metadata silently.
 * Create → Read → Update → soft Delete of stale seed markers.
 */
export async function runSilentBankBootstrap(): Promise<void> {
  const bootstrap: BankBootstrap = {
    id: BOOTSTRAP_ID,
    bankName: 'Bank Shop',
    maxBalance: MAX_BALANCE,
    currency: 'BRL',
    seededAt: new Date().toISOString(),
    version: 1,
  }

  try {
    const ref = doc(db, META, BOOTSTRAP_ID)
    const existing = await getDoc(ref)

    // CREATE
    if (!existing.exists()) {
      await setDoc(ref, bootstrap)
    } else {
      // READ + UPDATE
      const data = existing.data() as BankBootstrap
      if (data.version < bootstrap.version || data.maxBalance !== MAX_BALANCE) {
        await updateDoc(ref, {
          maxBalance: MAX_BALANCE,
          version: bootstrap.version,
          bankName: bootstrap.bankName,
          updatedAt: new Date().toISOString(),
        })
      }
    }

    // Seed catalog snapshots (idempotent upserts)
    await setDoc(doc(db, CATALOG, 'categories'), {
      items: CATEGORIES,
      count: CATEGORIES.length,
      updatedAt: new Date().toISOString(),
    })
    await setDoc(doc(db, CATALOG, 'stores'), {
      items: STORES.map(({ id, categoryId, name, tagline }) => ({
        id,
        categoryId,
        name,
        tagline,
      })),
      count: STORES.length,
      updatedAt: new Date().toISOString(),
    })
    await setDoc(doc(db, CATALOG, 'products'), {
      count: PRODUCTS.length,
      updatedAt: new Date().toISOString(),
    })

    // DELETE: remove stale bootstrap markers from previous versions
    const markers = await getDocs(collection(db, 'bootstrap_markers'))
    for (const marker of markers.docs) {
      const markerData = marker.data() as { version?: number }
      if ((markerData.version ?? 0) < bootstrap.version) {
        await deleteDoc(marker.ref)
      }
    }

    await setDoc(doc(db, 'bootstrap_markers', `v${bootstrap.version}`), {
      version: bootstrap.version,
      createdAt: new Date().toISOString(),
    })
  } catch {
    // Silent by design — app continues with local catalog data.
    localStorage.setItem(
      'bankshop_bootstrap',
      JSON.stringify({ ...bootstrap, source: 'local-fallback' }),
    )
  }
}
