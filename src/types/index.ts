export type CardOperator =
  | 'Visa'
  | 'Mastercard'
  | 'American Express'
  | 'Elo'
  | 'Hipercard'
  | 'Diners Club'
  | 'Discover'
  | 'Aura'

export interface UserAccount {
  id: string
  fullName: string
  email: string
  password: string
  cardOperator: CardOperator
  balance: number
  accountNumber: string
  agency: string
  createdAt: string
}

export interface CartItem {
  productId: string
  name: string
  price: number
  image: string
  storeId: string
  storeName: string
  categoryId: string
  quantity: number
}

export interface Product {
  id: string
  storeId: string
  name: string
  description: string
  price: number
  image: string
}

export interface StoreCta {
  label: string
  style: 'solid' | 'outline' | 'pill' | 'square' | 'underline'
}

export interface Store {
  id: string
  categoryId: string
  name: string
  tagline: string
  description: string
  theme: StoreTheme
  logoInitials: string
  heroImage: string
  cta: StoreCta
}

export interface StoreTheme {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
  surface: string
  fontDisplay: string
  pattern?: string
}

export interface Category {
  id: string
  name: string
  description: string
  image: string
  accent: string
  gradient: string
}

export interface PurchaseRecord {
  id: string
  userId: string
  userEmail: string
  items: CartItem[]
  total: number
  storeTheme: StoreTheme
  storeName: string
  createdAt: string
  emailStatus: 'sent' | 'queued' | 'failed'
}

export type PixKeyType = 'email' | 'cpf' | 'phone' | 'random'

export interface PixKey {
  id: string
  userId: string
  type: PixKeyType
  key: string
  createdAt: string
}

export type LedgerKind =
  | 'pix_out'
  | 'pix_in'
  | 'transfer_out'
  | 'transfer_in'
  | 'deposit'
  | 'purchase'
  | 'invest'
  | 'yield'
  | 'refund'

export interface LedgerEntry {
  id: string
  userId: string
  kind: LedgerKind
  title: string
  description: string
  amount: number
  signedAmount: number
  counterpartyName?: string
  counterpartyAccount?: string
  counterpartyKey?: string
  storeName?: string
  createdAt: string
  meta?: Record<string, string | number | boolean>
}

export interface InvestmentOption {
  id: string
  name: string
  description: string
  dailyRate: number
  risk: 'baixo' | 'moderado' | 'arrojado'
}

export interface InvestmentPosition {
  id: string
  userId: string
  optionId: string
  optionName: string
  principal: number
  accrued: number
  createdAt: string
  lastYieldAt: string
}

export interface BankBootstrap {
  id: string
  bankName: string
  maxBalance: number
  currency: string
  seededAt: string
  version: number
}

export const MAX_BALANCE = 100_000_000
export const MAX_PIX_HISTORY = 20
export const DAILY_YIELD_RATE = 0.005
export const YIELD_INTERVAL_MS = 24 * 60 * 60 * 1000
