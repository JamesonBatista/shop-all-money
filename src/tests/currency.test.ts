import { describe, expect, it } from 'vitest'
import { MAX_BALANCE } from '../types'
import {
  canAfford,
  canDeposit,
  formatBRL,
  formatCurrencyInput,
  parseCurrencyInput,
  validateBalance,
} from '../utils/currency'

describe('currency utils', () => {
  it('formats BRL values', () => {
    expect(formatBRL(1500)).toContain('1.500')
    expect(formatBRL(1500)).toContain('R$')
  })

  it('formats and parses currency input', () => {
    expect(formatCurrencyInput('123456')).toBe(formatBRL(1234.56))
    expect(parseCurrencyInput('R$ 1.234,56')).toBe(1234.56)
    expect(parseCurrencyInput('')).toBe(0)
  })

  it('rejects balances above 100 million', () => {
    const result = validateBalance(MAX_BALANCE + 1)
    expect(result.ok).toBe(false)
    expect(result.message).toMatch(/máximo permitido/i)
  })

  it('accepts valid balances', () => {
    expect(validateBalance(MAX_BALANCE).ok).toBe(true)
    expect(validateBalance(0).ok).toBe(true)
  })

  it('validates deposits against the ceiling', () => {
    expect(canDeposit(90_000_000, 5_000_000).ok).toBe(true)
    expect(canDeposit(90_000_000, 20_000_000).ok).toBe(false)
    expect(canDeposit(10, 0).ok).toBe(false)
  })

  it('checks affordability', () => {
    expect(canAfford(1000, 500)).toBe(true)
    expect(canAfford(1000, 1500)).toBe(false)
    expect(canAfford(1000, 0)).toBe(false)
  })
})
