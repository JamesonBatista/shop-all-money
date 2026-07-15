import { useMemo, useState } from 'react'
import { INVESTMENT_OPTIONS } from '../../../data/investments'
import { Button } from '../../../components/ui/Button'
import { CurrencyInput } from '../../../components/ui/CurrencyInput'
import { useAuth } from '../../../context/AuthContext'
import { getUserInvestments, investAmount } from '../../../services/bankingOps'
import { formatBRL } from '../../../utils/currency'

interface InvestPanelProps {
  onDone: () => void
}

export function InvestPanel({ onDone }: InvestPanelProps) {
  const { user, refreshUser } = useAuth()
  const [optionId, setOptionId] = useState(INVESTMENT_OPTIONS[0].id)
  const [display, setDisplay] = useState('')
  const [amount, setAmount] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)
  const [tick, setTick] = useState(0)

  const positions = useMemo(() => (user ? getUserInvestments(user.id) : []), [user, tick])

  if (!user) return null

  async function submit() {
    if (!user) return
    const account = user
    setError('')
    setSuccess('')
    setBusy(true)
    try {
      const position = await investAmount({ user: account, optionId, amount })
      await refreshUser()
      setSuccess(`Investimento em ${position.optionName} de ${formatBRL(amount)} realizado.`)
      setDisplay('')
      setAmount(0)
      setTick((t) => t + 1)
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no investimento.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bank-feature" data-testid="invest-panel">
      <h3>Investir</h3>
      <p className="bank-feature__sub">
        Três opções com retorno de 0,5% ao dia. O rendimento é creditado no login a cada 24h.
      </p>
      {error ? (
        <div className="auth-alert" role="alert">
          {error}
        </div>
      ) : null}
      {success ? <div className="success-banner">{success}</div> : null}

      <div className="invest-options">
        {INVESTMENT_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`invest-option ${optionId === option.id ? 'is-active' : ''}`}
            onClick={() => setOptionId(option.id)}
          >
            <strong>{option.name}</strong>
            <span>{option.description}</span>
            <em>0,5% a.d. · risco {option.risk}</em>
          </button>
        ))}
      </div>

      <CurrencyInput
        label="Valor a investir"
        value={display}
        onChange={(formatted, numeric) => {
          setDisplay(formatted)
          setAmount(numeric)
        }}
      />
      <p className="bank-feature__meta">Saldo disponível: {formatBRL(user.balance)}</p>
      <Button variant="gold" disabled={busy || amount <= 0} onClick={submit}>
        {busy ? 'Aplicando…' : 'Confirmar investimento'}
      </Button>

      <div className="bank-feature__block">
        <h4>Minhas aplicações</h4>
        {positions.length === 0 ? (
          <p className="bank-feature__meta">Nenhum investimento ativo.</p>
        ) : (
          <ul className="bank-list">
            {positions.map((p) => (
              <li key={p.id}>
                <div>
                  <strong>{p.optionName}</strong>
                  <span>Principal {formatBRL(p.principal)} · Acumulado {formatBRL(p.accrued)}</span>
                  <small>Desde {new Date(p.createdAt).toLocaleString('pt-BR')}</small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
