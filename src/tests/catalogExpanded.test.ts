import { describe, expect, it } from 'vitest'
import { CATEGORIES } from '../data/categories'
import { PRODUCTS, getProductsByStore } from '../data/products'
import { STORES, getStoresByCategory } from '../data/stores'

describe('catálogo expandido e identidade das lojas', () => {
  it('cada categoria possui no mínimo 5 lojas', () => {
    for (const category of CATEGORIES) {
      const stores = getStoresByCategory(category.id)
      expect(stores.length, category.id).toBeGreaterThanOrEqual(5)
    }
    expect(STORES.length).toBeGreaterThanOrEqual(40)
  })

  it('cada loja possui exatamente 10 itens', () => {
    for (const store of STORES) {
      const products = getProductsByStore(store.id)
      expect(products.length, store.id).toBe(10)
    }
    expect(PRODUCTS.length).toBe(STORES.length * 10)
  })

  it('cada loja tem CTA, layout e tema próprios', () => {
    const labels = new Set(STORES.map((s) => s.cta.label))
    expect(labels.size).toBeGreaterThan(10)
    for (const store of STORES) {
      expect(store.cta.label.length).toBeGreaterThan(3)
      expect(['solid', 'outline', 'pill', 'square', 'underline']).toContain(store.cta.style)
      expect(['editorial-light', 'editorial-dark', 'catalog', 'boutique', 'lineup']).toContain(
        store.layout,
      )
      expect(store.chrome?.backLabel.length).toBeGreaterThan(2)
      expect(store.chrome?.cartLabel.length).toBeGreaterThan(2)
      expect(store.theme.background).toBeTruthy()
      expect(store.theme.accent).toBeTruthy()
    }
  })

  it('todas as imagens usam URL https válida', () => {
    for (const product of PRODUCTS) {
      expect(product.image).toMatch(/^https:\/\//)
      expect(product.price).toBeGreaterThan(0)
      expect(product.name.length).toBeGreaterThan(2)
      expect(product.description.length).toBeGreaterThan(3)
    }
  })

  it('Patek usa grid editorial com referências e imagens oficiais', () => {
    const patek = STORES.find((s) => s.id === 'patek')
    expect(patek?.layout).toBe('editorial-light')
    expect(patek?.heroTitle).toBe('Grand Complications')
    const products = getProductsByStore('patek')
    expect(products.length).toBe(10)
    for (const product of products) {
      expect(product.image).toMatch(/^https:\/\/patek-res\.cloudinary\.com\//)
      expect(product.material).toBeTruthy()
      expect(product.name).toMatch(/[0-9]/)
    }
  })

  it('não há IDs de produto duplicados', () => {
    const ids = PRODUCTS.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
