import { INVESTMENT_OPTIONS } from '../data/investments'
import { trackInvest, trackPix, trackTransfer } from '../firebase/analytics'
import {
  appendLedger,
  findPixKey,
  listInvestments,
  listLedger,
  listPixKeys,
  listPixLedger,
  listPurchases,
  saveInvestment,
  savePixKey,
  updateInvestment,
} from '../firebase/banking'
import {
  findUserByAccountNumber,
  getUserById,
  updateUserBalance,
} from '../firebase/users'
import type {
  InvestmentPosition,
  LedgerEntry,
  PixKey,
  PixKeyType,
  UserAccount,
} from '../types'
import { DAILY_YIELD_RATE, MAX_BALANCE, YIELD_INTERVAL_MS } from '../types'

function nowIso() {
  return new Date().toISOString()
}

function assertAmount(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Informe um valor válido.')
  }
}

export async function transferByAccount(params: {
  from: UserAccount
  accountNumber: string
  amount: number
}): Promise<{ to: UserAccount }> {
  assertAmount(params.amount)
  if (params.amount > params.from.balance) throw new Error('Saldo insuficiente.')
  if (params.accountNumber.trim() === params.from.accountNumber) {
    throw new Error('Não é possível transferir para a própria conta.')
  }

  const to = await findUserByAccountNumber(params.accountNumber.trim())
  if (!to) throw new Error('Conta não encontrada. Nenhuma transferência foi realizada.')

  const nextFrom = params.from.balance - params.amount
  const nextTo = Math.min(to.balance + params.amount, MAX_BALANCE)

  await updateUserBalance(params.from.id, nextFrom)
  await updateUserBalance(to.id, nextTo)

  const createdAt = nowIso()
  await appendLedger({
    id: crypto.randomUUID(),
    userId: params.from.id,
    kind: 'transfer_out',
    title: 'Transferência enviada',
    description: `Para ${to.fullName} · Conta ${to.accountNumber}`,
    amount: params.amount,
    signedAmount: -params.amount,
    counterpartyName: to.fullName,
    counterpartyAccount: to.accountNumber,
    createdAt,
  })
  await appendLedger({
    id: crypto.randomUUID(),
    userId: to.id,
    kind: 'transfer_in',
    title: 'Transferência recebida',
    description: `De ${params.from.fullName} · Conta ${params.from.accountNumber}`,
    amount: params.amount,
    signedAmount: params.amount,
    counterpartyName: params.from.fullName,
    counterpartyAccount: params.from.accountNumber,
    createdAt,
  })

  await trackTransfer()
  return { to }
}

export async function createPixKeyForUser(params: {
  user: UserAccount
  type: PixKeyType
  key?: string
}): Promise<PixKey> {
  let key = (params.key || '').trim()
  if (params.type === 'email') key = (params.key || params.user.email).trim().toLowerCase()
  if (params.type === 'random') key = key || `bs${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`
  if (params.type === 'cpf' && !key) throw new Error('Informe o CPF da chave Pix.')
  if (params.type === 'phone' && !key) throw new Error('Informe o telefone da chave Pix.')
  if (!key) throw new Error('Informe a chave Pix.')

  const existing = findPixKey(key)
  if (existing) throw new Error('Esta chave Pix já está em uso.')

  const pixKey: PixKey = {
    id: crypto.randomUUID(),
    userId: params.user.id,
    type: params.type,
    key,
    createdAt: nowIso(),
  }
  return savePixKey(pixKey)
}

export async function lookupPixRecipient(key: string): Promise<{
  pixKey: PixKey
  user: UserAccount
}> {
  const pixKey = findPixKey(key)
  if (!pixKey) throw new Error('Chave Pix não encontrada.')
  const user = await getUserById(pixKey.userId)
  if (!user) throw new Error('Titular da chave não encontrado.')
  return { pixKey, user }
}

export async function transferByPixKey(params: {
  from: UserAccount
  key: string
  amount: number
}): Promise<{ to: UserAccount; pixKey: PixKey }> {
  assertAmount(params.amount)
  if (params.amount > params.from.balance) throw new Error('Saldo insuficiente.')

  const { pixKey, user: to } = await lookupPixRecipient(params.key)
  if (to.id === params.from.id) throw new Error('Não é possível transferir para você mesmo.')

  const nextFrom = params.from.balance - params.amount
  const nextTo = Math.min(to.balance + params.amount, MAX_BALANCE)
  await updateUserBalance(params.from.id, nextFrom)
  await updateUserBalance(to.id, nextTo)

  const createdAt = nowIso()
  await appendLedger({
    id: crypto.randomUUID(),
    userId: params.from.id,
    kind: 'pix_out',
    title: 'Pix enviado',
    description: `Para ${to.fullName} · chave ${pixKey.key}`,
    amount: params.amount,
    signedAmount: -params.amount,
    counterpartyName: to.fullName,
    counterpartyAccount: to.accountNumber,
    counterpartyKey: pixKey.key,
    createdAt,
  })
  await appendLedger({
    id: crypto.randomUUID(),
    userId: to.id,
    kind: 'pix_in',
    title: 'Pix recebido',
    description: `De ${params.from.fullName} · chave ${pixKey.key}`,
    amount: params.amount,
    signedAmount: params.amount,
    counterpartyName: params.from.fullName,
    counterpartyAccount: params.from.accountNumber,
    counterpartyKey: pixKey.key,
    createdAt,
  })

  await trackPix()
  return { to, pixKey }
}

export async function investAmount(params: {
  user: UserAccount
  optionId: string
  amount: number
}): Promise<InvestmentPosition> {
  assertAmount(params.amount)
  if (params.amount > params.user.balance) throw new Error('Saldo insuficiente.')
  const option = INVESTMENT_OPTIONS.find((o) => o.id === params.optionId)
  if (!option) throw new Error('Opção de investimento inválida.')

  const nextBalance = params.user.balance - params.amount
  await updateUserBalance(params.user.id, nextBalance)

  const createdAt = nowIso()
  const position: InvestmentPosition = {
    id: crypto.randomUUID(),
    userId: params.user.id,
    optionId: option.id,
    optionName: option.name,
    principal: params.amount,
    accrued: 0,
    createdAt,
    lastYieldAt: createdAt,
  }
  await saveInvestment(position)
  await appendLedger({
    id: crypto.randomUUID(),
    userId: params.user.id,
    kind: 'invest',
    title: `Aplicação · ${option.name}`,
    description: `Investimento de ${params.amount.toFixed(2)} a ${option.dailyRate * 100}% a.d.`,
    amount: params.amount,
    signedAmount: -params.amount,
    createdAt,
    meta: { optionId: option.id },
  })
  await trackInvest(params.amount, option.name)
  return position
}

/** Applies 0.5% daily yield for each position with elapsed >= 24h. Returns total credited. */
export async function processDailyYields(userId: string, now = Date.now()): Promise<number> {
  const positions = listInvestments(userId)
  let totalYield = 0
  const user = await getUserById(userId)
  if (!user) return 0

  let balance = user.balance

  for (const position of positions) {
    const last = new Date(position.lastYieldAt).getTime()
    const elapsed = now - last
    if (elapsed < YIELD_INTERVAL_MS) continue

    const cycles = Math.floor(elapsed / YIELD_INTERVAL_MS)
    let yieldAmount = 0
    let principalBase = position.principal
    for (let i = 0; i < cycles; i += 1) {
      yieldAmount += principalBase * DAILY_YIELD_RATE
    }
    yieldAmount = Math.round(yieldAmount * 100) / 100
    if (yieldAmount <= 0) continue

    balance = Math.min(balance + yieldAmount, MAX_BALANCE)
    totalYield += yieldAmount

    const updated: InvestmentPosition = {
      ...position,
      accrued: position.accrued + yieldAmount,
      lastYieldAt: new Date(last + cycles * YIELD_INTERVAL_MS).toISOString(),
    }
    await updateInvestment(updated)
    await appendLedger({
      id: crypto.randomUUID(),
      userId,
      kind: 'yield',
      title: `Rendimento · ${position.optionName}`,
      description: `Crédito de ${cycles} ciclo(s) a ${DAILY_YIELD_RATE * 100}% a.d.`,
      amount: yieldAmount,
      signedAmount: yieldAmount,
      createdAt: nowIso(),
      meta: { positionId: position.id, cycles },
    })
  }

  if (totalYield > 0) {
    await updateUserBalance(userId, balance)
  }
  return totalYield
}

export async function recordPurchaseLedger(params: {
  userId: string
  storeName: string
  total: number
  createdAt: string
}): Promise<void> {
  await appendLedger({
    id: crypto.randomUUID(),
    userId: params.userId,
    kind: 'purchase',
    title: `Compra · ${params.storeName}`,
    description: `Pagamento marketplace Bank Shop`,
    amount: params.total,
    signedAmount: -params.total,
    storeName: params.storeName,
    createdAt: params.createdAt,
  })
}

export async function recordDepositLedger(params: {
  userId: string
  amount: number
}): Promise<void> {
  await appendLedger({
    id: crypto.randomUUID(),
    userId: params.userId,
    kind: 'deposit',
    title: 'Depósito',
    description: 'Crédito em conta Bank Shop',
    amount: params.amount,
    signedAmount: params.amount,
    createdAt: nowIso(),
  })
}

export function getUserPixKeys(userId: string) {
  return listPixKeys(userId)
}

export function getUserPixHistory(userId: string) {
  return listPixLedger(userId)
}

export function getUserStatement(userId: string): LedgerEntry[] {
  return listLedger(userId)
}

export function getUserInvestments(userId: string) {
  return listInvestments(userId)
}

export function getUserPurchases(userId: string) {
  return listPurchases(userId)
}
