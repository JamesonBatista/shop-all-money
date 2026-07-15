import { describe, expect, it } from 'vitest'
import { CATEGORIES } from '../data/categories'
import { PRODUCTS, getProductsByStore } from '../data/products'
import { STORES, getStoresByCategory } from '../data/stores'

/** Top maisons expected per niche (world's most exclusive / expensive). */
const EXPECTED_MAISONS: Record<string, string[]> = {
  relogios: [
    'Patek Philippe',
    'Richard Mille',
    'Audemars Piguet',
    'Vacheron Constantin',
    'Rolex',
  ],
  roupas: ['Hermès', 'Chanel', 'Dior', 'Louis Vuitton', 'Loro Piana'],
  casas: [
    "Sotheby's",
    "Christie's",
    'Knight Frank',
    'Engel & Völkers',
    'Luxury Portfolio',
  ],
  moveis: ['Fendi Casa', 'Minotti', 'B&B Italia', 'Poliform', 'Roche Bobois'],
  eletronicos: ['Bang & Olufsen', 'Devialet', 'Leica', 'Sony Signature', 'Linn'],
  joias: ['Graff', 'Harry Winston', 'Van Cleef & Arpels', 'Cartier', 'Bulgari'],
  carros: ['Bugatti', 'Rolls-Royce', 'Ferrari', 'Pagani', 'Lamborghini'],
  arte: ["Sotheby's", "Christie's", 'Phillips', 'Gagosian', 'Pace'],
}

describe('requisitos de marca, grid e catálogo', () => {
  it('cada nicho tem no mínimo 5 lojas das maisons mais caras', () => {
    for (const category of CATEGORIES) {
      const stores = getStoresByCategory(category.id)
      expect(stores.length, category.id).toBeGreaterThanOrEqual(5)
      const names = stores.map((s) => s.name)
      for (const expected of EXPECTED_MAISONS[category.id] ?? []) {
        expect(
          names.some((n) => n.includes(expected) || expected.includes(n.split(' ')[0])),
          `${category.id} missing ${expected} in ${names.join(', ')}`,
        ).toBe(true)
      }
    }
  })

  it('nenhuma imagem de produto se repete', () => {
    const images = PRODUCTS.map((p) => p.image)
    expect(new Set(images).size).toBe(PRODUCTS.length)
  })

  it('imagens seguem o tema do nicho (sem misturar carros em moda etc.)', () => {
    const storeById = Object.fromEntries(STORES.map((s) => [s.id, s]))
    const expectTag: Record<string, RegExp> = {
      roupas: /theme=fashion-|handbag|fashion|cashmere/i,
      carros: /theme=supercar|cdn\.ferrari/i,
      relogios: /theme=luxury-wristwatch|patek-res/i,
      joias: /theme=diamond-jewelry/i,
      eletronicos: /theme=hifi-speaker|theme=camera-leica/i,
      casas: /theme=luxury-villa/i,
      moveis: /theme=designer-furniture/i,
      arte: /theme=painting-art/i,
    }

    for (const product of PRODUCTS) {
      const categoryId = storeById[product.storeId]?.categoryId
      expect(categoryId, product.id).toBeTruthy()
      expect(
        expectTag[categoryId!].test(product.image),
        `${product.storeId}/${product.name} -> ${product.image}`,
      ).toBe(true)
      expect(product.image.includes('picsum.photos')).toBe(false)
      expect(product.image.includes('loremflickr.com')).toBe(false)
    }

    for (const product of PRODUCTS.filter((p) => storeById[p.storeId]?.categoryId === 'roupas')) {
      expect(product.image).not.toMatch(/theme=supercar|theme=luxury-wristwatch/)
    }
  })

  it('Patek segue o grid editorial oficial (Grand Complications)', () => {
    const patek = STORES.find((s) => s.id === 'patek')
    expect(patek?.layout).toBe('editorial-light')
    expect(patek?.heroTitle).toBe('Grand Complications')
    expect(patek?.heroEyebrow).toBe('Collection')
    expect(patek?.description).toMatch(/Grand Complications collection/i)
    expect(patek?.chrome.backLabel).not.toMatch(/^voltar/i)
    expect(patek?.chrome.cartLabel).not.toMatch(/carrinho|sacola/i)

    const products = getProductsByStore('patek')
    expect(products).toHaveLength(10)
    for (const product of products) {
      expect(product.image).toMatch(/^https:\/\/patek-res\.cloudinary\.com\//)
      expect(product.material).toBeTruthy()
      expect(product.name).toMatch(/[0-9]/)
      expect(product.description.length).toBeGreaterThan(3)
    }
  })

  it('Ferrari usa layout line-up e imagens CDN oficiais', () => {
    const ferrari = STORES.find((s) => s.id === 'ferrari')
    expect(ferrari?.layout).toBe('lineup')
    const products = getProductsByStore('ferrari')
    expect(products.map((p) => p.name)).toEqual(
      expect.arrayContaining(['Revuelto', '296 GTB', 'SF90 Stradale', 'Purosangue']),
    )
    for (const product of products) {
      expect(product.image).toMatch(/^https:\/\/cdn\.ferrari\.com\//)
    }
  })

  it('Bang & Olufsen segue catálogo tipo product-card com nomes reais', () => {
    const bno = STORES.find((s) => s.id === 'bang-olufsen')
    expect(bno?.layout).toBe('catalog')
    const names = getProductsByStore('bang-olufsen').map((p) => p.name)
    expect(names).toEqual(
      expect.arrayContaining(['Beosound A9', 'Beosound Balance', 'Beolit 20', 'Beoplay H95']),
    )
  })

  it('cada loja tem chrome temático distinto (voltar/carrinho não genéricos iguais)', () => {
    const backLabels = STORES.map((s) => s.chrome.backLabel)
    const cartLabels = STORES.map((s) => s.chrome.cartLabel)
    expect(new Set(backLabels).size).toBeGreaterThan(15)
    expect(new Set(cartLabels).size).toBeGreaterThan(10)
    for (const store of STORES) {
      expect(store.chrome.backLabel.length).toBeGreaterThan(2)
      expect(store.chrome.cartLabel.length).toBeGreaterThan(2)
      expect(['solid', 'outline', 'pill', 'square', 'underline']).toContain(store.chrome.style)
      expect(store.chrome.backLabel.toLowerCase()).not.toBe('voltar às lojas')
      expect(store.chrome.cartLabel.toLowerCase()).not.toBe('sacola')
    }
  })

  it('cada loja tem layout, CTA e tipografia próprios alinhados ao tema', () => {
    for (const store of STORES) {
      expect(['editorial-light', 'editorial-dark', 'catalog', 'boutique', 'lineup']).toContain(
        store.layout,
      )
      expect(store.cta.label.length).toBeGreaterThan(3)
      expect(store.theme.background).toBeTruthy()
      expect(store.theme.accent).toBeTruthy()
      expect(store.theme.fontDisplay).toMatch(
        /Cormorant|Outfit|Playfair|Bodoni|Libre Baskerville|Space Grotesk|DM Sans/,
      )
      expect(getProductsByStore(store.id)).toHaveLength(10)
    }
  })

  it('carros usam layout lineup inspirado no Ferrari line-up', () => {
    const cars = getStoresByCategory('carros')
    expect(cars.every((s) => s.layout === 'lineup')).toBe(true)
  })
})
