import { motion } from 'framer-motion'
import { useMemo, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AnimatedBackground } from '../../components/layout/AnimatedBackground'
import { Button } from '../../components/ui/Button'
import { CurrencyInput } from '../../components/ui/CurrencyInput'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { useAuth } from '../../context/AuthContext'
import { CARD_OPERATORS } from '../../data/cards'
import type { CardOperator } from '../../types'
import { MAX_BALANCE } from '../../types'
import { formatBRL, validateBalance } from '../../utils/currency'
import './Auth.css'

export function RegisterPage() {
  const { register, user, loading } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cardOperator, setCardOperator] = useState<CardOperator | ''>('')
  const [creditDisplay, setCreditDisplay] = useState('')
  const [creditValue, setCreditValue] = useState(0)
  const [creditError, setCreditError] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const cardOptions = useMemo(
    () => CARD_OPERATORS.map((c) => ({ value: c, label: c })),
    [],
  )

  if (!loading && user) return <Navigate to="/banco" replace />

  function handleCreditChange(formatted: string, numeric: number) {
    setCreditDisplay(formatted)
    setCreditValue(numeric)
    if (numeric > MAX_BALANCE) {
      setCreditError(`O máximo permitido é ${formatBRL(MAX_BALANCE)}.`)
    } else {
      setCreditError('')
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!cardOperator) {
      setError('Selecione uma operadora de cartão.')
      return
    }

    const check = validateBalance(creditValue)
    if (!check.ok) {
      setCreditError(check.message || 'Valor inválido.')
      return
    }

    setSubmitting(true)
    try {
      await register({
        fullName,
        email,
        password,
        cardOperator,
        balance: creditValue,
      })
      navigate('/banco')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível registrar.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <AnimatedBackground />
      <motion.div
        className="auth-shell"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.45 }}
      >
        <aside className="auth-brand">
          <motion.div
            className="auth-float"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.8, repeat: Infinity }}
          >
            Abertura de conta
          </motion.div>
          <h2 className="auth-brand__mark">
            Bank
            <span>Shop</span>
          </h2>
          <p className="auth-brand__line">
            Cadastre seu crédito e navegue pelo marketplace com o saldo real da sua conta.
          </p>
        </aside>

        <section className="auth-panel">
          <h1>Criar conta</h1>
          <p className="auth-panel__sub">Preencha os dados para liberar seu crédito digital.</p>

          <form className="auth-form" onSubmit={onSubmit} noValidate>
            {error ? <div className="auth-alert">{error}</div> : null}

            <Input
              label="Nome completo"
              name="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              label="E-mail"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Senha"
              type="password"
              name="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Select
              label="Cartão de crédito"
              name="cardOperator"
              placeholder="Selecione a operadora"
              value={cardOperator}
              onChange={(e) => setCardOperator(e.target.value as CardOperator)}
              options={cardOptions}
              required
            />

            {cardOperator ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <CurrencyInput
                  label={`Valor em crédito (${cardOperator})`}
                  value={creditDisplay}
                  onChange={handleCreditChange}
                  error={creditError}
                />
              </motion.div>
            ) : null}

            <div className="auth-actions">
              <Button type="submit" variant="gold" disabled={submitting || !!creditError}>
                {submitting ? 'Criando conta…' : 'Registrar e acessar'}
              </Button>
            </div>
          </form>

          <p className="auth-switch">
            Já tem conta? <Link to="/login">Fazer login</Link>
          </p>
        </section>
      </motion.div>
    </div>
  )
}
