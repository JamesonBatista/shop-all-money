import { describe, expect, it } from 'vitest'
import { CATEGORIES } from '../data/categories'
import { PRODUCTS, getProductsByStore } from '../data/products'
import { STORES, getStoresByCategory } from '../data/stores'

describe('catalog integrity', () => {
  it('has all expected niches', () => {
    const ids = CATEGORIES.map((c) => c.id)
    expect(ids).toEqual(
      expect.arrayContaining([
        'roupas',
        'relogios',
        'casas',
        'moveis',
        'eletronicos',
        'joias',
        'carros',
        'arte',
      ]),
    )
  })

  it('lists multiple luxury watch houses', () => {
    const watches = getStoresByCategory('relogios')
    expect(watches.length).toBeGreaterThanOrEqual(4)
    expect(watches.map((s) => s.name)).toEqual(
      expect.arrayContaining(['Rolex', 'Patek Philippe', 'Audemars Piguet', 'Omega']),
    )
  })

  it('every store has products', () => {
    for (const store of STORES) {
      const products = getProductsByStore(store.id)
      expect(products.length).toBeGreaterThan(0)
    }
  })

  it('products reference valid stores', () => {
    const storeIds = new Set(STORES.map((s) => s.id))
    for (const product of PRODUCTS) {
      expect(storeIds.has(product.storeId)).toBe(true)
      expect(product.price).toBeGreaterThan(0)
      expect(product.image).toMatch(/^https?:\/\//)
    }
  })
})
