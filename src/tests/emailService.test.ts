import { describe, expect, it } from 'vitest'
import { buildPurchaseEmailHtml } from '../services/emailService'
import type { CartItem, StoreTheme } from '../types'

const theme: StoreTheme = {
  primary: '#006039',
  secondary: '#a37e2c',
  accent: '#c4a35a',
  background: '#0b1f17',
  text: '#f4f0e6',
  surface: '#132e22',
  fontDisplay: 'serif',
}

const items: CartItem[] = [
  {
    productId: 'rx-1',
    name: 'Submariner',
    price: 98000,
    image: 'https://example.com/watch.jpg',
    storeId: 'rolex',
    storeName: 'Rolex',
    categoryId: 'relogios',
    quantity: 1,
  },
]

describe('emailService', () => {
  it('builds themed HTML with purchase details', () => {
    const html = buildPurchaseEmailHtml({
      customerName: 'Maria Souza',
      storeName: 'Rolex',
      items,
      total: 98000,
      theme,
    })

    expect(html).toContain('Maria Souza')
    expect(html).toContain('Rolex')
    expect(html).toContain('Submariner')
    expect(html).toContain('#006039')
    expect(html).toContain('Compra confirmada')
  })
})
