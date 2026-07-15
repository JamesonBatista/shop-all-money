import { describe, expect, it } from 'vitest'
import type { CartItem } from '../types'

function cartTotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0)
}

describe('cart logic', () => {
  it('sums item totals with quantity', () => {
    const items: CartItem[] = [
      {
        productId: 'a',
        name: 'A',
        price: 1000,
        image: '',
        storeId: 's',
        storeName: 'S',
        categoryId: 'c',
        quantity: 2,
      },
      {
        productId: 'b',
        name: 'B',
        price: 500,
        image: '',
        storeId: 's',
        storeName: 'S',
        categoryId: 'c',
        quantity: 1,
      },
    ]
    expect(cartTotal(items)).toBe(2500)
  })
})
