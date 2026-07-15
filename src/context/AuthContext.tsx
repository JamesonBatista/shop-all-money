import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { trackRegister } from '../firebase/analytics'
import {
  clearSession,
  createUser,
  findUserByEmail,
  getSessionUserId,
  getUserById,
  saveSession,
  updateUserBalance,
} from '../firebase/users'
import { processDailyYields, recordDepositLedger } from '../services/bankingOps'
import type { CardOperator, UserAccount } from '../types'
import { MAX_BALANCE } from '../types'
import { canDeposit, validateBalance } from '../utils/currency'
import {
  generateAccountNumber,
  generateAgency,
  isValidEmail,
  isValidFullName,
  isValidPassword,
} from '../utils/validation'

interface RegisterInput {
  fullName: string
  email: string
  password: string
  cardOperator: CardOperator
  balance: number
}

interface AuthContextValue {
  user: UserAccount | null
  loading: boolean
  lastYieldCredit: number
  login: (email: string, password: string) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => void
  deposit: (amount: number) => Promise<void>
  debit: (amount: number) => Promise<void>
  refreshUser: () => Promise<void>
  clearYieldNotice: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastYieldCredit, setLastYieldCredit] = useState(0)

  const refreshUser = useCallback(async () => {
    const id = getSessionUserId()
    if (!id) {
      setUser(null)
      return
    }
    const found = await getUserById(id)
    setUser(found)
  }, [])

  useEffect(() => {
    void (async () => {
      const id = getSessionUserId()
      if (id) {
        const credited = await processDailyYields(id)
        if (credited > 0) setLastYieldCredit(credited)
      }
      await refreshUser()
      setLoading(false)
    })()
  }, [refreshUser])

  const login = useCallback(async (email: string, password: string) => {
    if (!isValidEmail(email)) throw new Error('E-mail inválido.')
    const found = await findUserByEmail(email)
    if (!found || found.password !== password) {
      throw new Error('E-mail ou senha incorretos.')
    }
    saveSession(found.id)
    const credited = await processDailyYields(found.id)
    setLastYieldCredit(credited)
    const refreshed = await getUserById(found.id)
    setUser(refreshed)
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    if (!isValidFullName(input.fullName)) {
      throw new Error('Informe seu nome completo.')
    }
    if (!isValidEmail(input.email)) {
      throw new Error('E-mail inválido.')
    }
    if (!isValidPassword(input.password)) {
      throw new Error('A senha deve ter ao menos 6 caracteres.')
    }
    if (!input.cardOperator) {
      throw new Error('Selecione uma operadora de cartão.')
    }
    const balanceCheck = validateBalance(input.balance)
    if (!balanceCheck.ok) throw new Error(balanceCheck.message)
    if (input.balance <= 0) throw new Error('Informe um valor de crédito.')

    const existing = await findUserByEmail(input.email)
    if (existing) throw new Error('Este e-mail já está cadastrado.')

    const account: UserAccount = {
      id: crypto.randomUUID(),
      fullName: input.fullName.trim(),
      email: input.email.trim().toLowerCase(),
      password: input.password,
      cardOperator: input.cardOperator,
      balance: input.balance,
      accountNumber: generateAccountNumber(),
      agency: generateAgency(),
      createdAt: new Date().toISOString(),
    }

    await createUser(account)
    await trackRegister(account.fullName)
    saveSession(account.id)
    setLastYieldCredit(0)
    setUser(account)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
    setLastYieldCredit(0)
  }, [])

  const deposit = useCallback(
    async (amount: number) => {
      if (!user) throw new Error('Faça login para depositar.')
      const check = canDeposit(user.balance, amount)
      if (!check.ok) throw new Error(check.message)
      const next = Math.min(user.balance + amount, MAX_BALANCE)
      await updateUserBalance(user.id, next)
      await recordDepositLedger({ userId: user.id, amount })
      setUser({ ...user, balance: next })
    },
    [user],
  )

  const debit = useCallback(
    async (amount: number) => {
      if (!user) throw new Error('Faça login para comprar.')
      if (amount > user.balance) throw new Error('Saldo insuficiente.')
      const next = user.balance - amount
      await updateUserBalance(user.id, next)
      setUser({ ...user, balance: next })
    },
    [user],
  )

  const clearYieldNotice = useCallback(() => setLastYieldCredit(0), [])

  const value = useMemo(
    () => ({
      user,
      loading,
      lastYieldCredit,
      login,
      register,
      logout,
      deposit,
      debit,
      refreshUser,
      clearYieldNotice,
    }),
    [
      user,
      loading,
      lastYieldCredit,
      login,
      register,
      logout,
      deposit,
      debit,
      refreshUser,
      clearYieldNotice,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
