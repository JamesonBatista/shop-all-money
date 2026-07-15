import { describe, expect, it } from 'vitest'
import {
  generateAccountNumber,
  generateAgency,
  isValidEmail,
  isValidFullName,
  isValidPassword,
} from '../utils/validation'

describe('validation utils', () => {
  it('validates emails', () => {
    expect(isValidEmail('user@bank.com')).toBe(true)
    expect(isValidEmail('invalid')).toBe(false)
  })

  it('requires full name with at least two words', () => {
    expect(isValidFullName('Ana Silva')).toBe(true)
    expect(isValidFullName('Ana')).toBe(false)
  })

  it('requires password length >= 6', () => {
    expect(isValidPassword('123456')).toBe(true)
    expect(isValidPassword('123')).toBe(false)
  })

  it('generates account and agency patterns', () => {
    expect(generateAccountNumber()).toMatch(/^\d{5}-\d{3}$/)
    expect(generateAgency()).toMatch(/^\d{4}$/)
  })
})
