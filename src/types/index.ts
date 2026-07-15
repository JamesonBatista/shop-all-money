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

export interface Store {
  id: string
  categoryId: string
  name: string
  tagline: string
  description: string
  theme: StoreTheme
  logoInitials: string
  heroImage: string
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

export interface BankBootstrap {
  id: string
  bankName: string
  maxBalance: number
  currency: string
  seededAt: string
  version: number
}

export const MAX_BALANCE = 100_000_000
