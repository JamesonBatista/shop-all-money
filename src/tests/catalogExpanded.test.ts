import { describe, expect, it } from 'vitest'
import { PRODUCTS, getProductsByStore } from '../data/products'
import { STORES } from '../data/stores'

describe('catálogo expandido e identidade das lojas', () => {
  it('cada loja possui exatamente 10 itens', () => {
    for (const store of STORES) {
      const products = getProductsByStore(store.id)
      expect(products.length, store.id).toBe(10)
    }
    expect(PRODUCTS.length).toBe(STORES.length * 10)
  })

  it('cada loja tem CTA próprio (label + estilo)', () => {
    const labels = new Set(STORES.map((s) => s.cta.label))
    expect(labels.size).toBeGreaterThan(10)
    for (const store of STORES) {
      expect(store.cta.label.length).toBeGreaterThan(3)
      expect(['solid', 'outline', 'pill', 'square', 'underline']).toContain(store.cta.style)
    }
  })

  it('todas as imagens usam URL https válida', () => {
    for (const product of PRODUCTS) {
      expect(product.image).toMatch(/^https:\/\/images\.unsplash\.com\//)
      expect(product.price).toBeGreaterThan(0)
      expect(product.name.length).toBeGreaterThan(2)
      expect(product.description.length).toBeGreaterThan(5)
    }
  })

  it('não há IDs de produto duplicados', () => {
    const ids = PRODUCTS.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
