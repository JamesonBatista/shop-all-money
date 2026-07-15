import { MAX_BALANCE } from '../types'

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/** Formats digits-only input as Brazilian currency display (R$ 1.234,56) */
export function formatCurrencyInput(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  const number = Number(digits) / 100
  return formatBRL(number)
}

export function parseCurrencyInput(formatted: string): number {
  const digits = formatted.replace(/\D/g, '')
  if (!digits) return 0
  return Number(digits) / 100
}

export function validateBalance(value: number): { ok: boolean; message?: string } {
  if (Number.isNaN(value) || value < 0) {
    return { ok: false, message: 'Informe um valor válido.' }
  }
  if (value > MAX_BALANCE) {
    return {
      ok: false,
      message: `O valor máximo permitido é ${formatBRL(MAX_BALANCE)}.`,
    }
  }
  return { ok: true }
}

export function canDeposit(current: number, amount: number): { ok: boolean; message?: string } {
  if (amount <= 0) {
    return { ok: false, message: 'O depósito deve ser maior que zero.' }
  }
  const next = current + amount
  if (next > MAX_BALANCE) {
    return {
      ok: false,
      message: `Depósito excede o limite. Máximo disponível: ${formatBRL(MAX_BALANCE - current)}.`,
    }
  }
  return { ok: true }
}

export function canAfford(balance: number, total: number): boolean {
  return balance >= total && total > 0
}
