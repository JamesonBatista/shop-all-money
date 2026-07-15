import { useMemo, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { CurrencyInput } from '../../../components/ui/CurrencyInput'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { useAuth } from '../../../context/AuthContext'
import {
  createPixKeyForUser,
  getUserPixHistory,
  getUserPixKeys,
  lookupPixRecipient,
  transferByPixKey,
} from '../../../services/bankingOps'
import type { PixKeyType, UserAccount } from '../../../types'
import { formatBRL } from '../../../utils/currency'

interface PixPanelProps {
  onDone: () => void
}

type Step = 'home' | 'create' | 'transfer' | 'confirm'

export function PixPanel({ onDone }: PixPanelProps) {
  const { user, refreshUser } = useAuth()
  const [step, setStep] = useState<Step>('home')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)
  const [tick, setTick] = useState(0)

  const [keyType, setKeyType] = useState<PixKeyType>('email')
  const [newKey, setNewKey] = useState('')

  const [pixKeyInput, setPixKeyInput] = useState('')
  const [display, setDisplay] = useState('')
  const [amount, setAmount] = useState(0)
  const [recipient, setRecipient] = useState<UserAccount | null>(null)
  const [resolvedKey, setResolvedKey] = useState('')

  const keys = useMemo(() => (user ? getUserPixKeys(user.id) : []), [user, tick])
  const history = useMemo(() => (user ? getUserPixHistory(user.id) : []), [user, tick])

  if (!user) return null

  async function handleCreateKey() {
    if (!user) return
    const account = user
    setError('')
    setBusy(true)
    try {
      await createPixKeyForUser({ user: account, type: keyType, key: newKey || undefined })
      setSuccess('Chave Pix criada com sucesso.')
      setNewKey('')
      setTick((t) => t + 1)
      setStep('home')
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a chave.')
    } finally {
      setBusy(false)
    }
  }

  async function handleLookup() {
    setError('')
    setBusy(true)
    try {
      const result = await lookupPixRecipient(pixKeyInput)
      setRecipient(result.user)
      setResolvedKey(result.pixKey.key)
      setStep('confirm')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chave inválida.')
      setRecipient(null)
    } finally {
      setBusy(false)
    }
  }

  async function handleConfirmTransfer() {
    if (!recipient || !user) return
    const account = user
    setError('')
    setBusy(true)
    try {
      await transferByPixKey({ from: account, key: resolvedKey, amount })
      await refreshUser()
      setSuccess(`Pix de ${formatBRL(amount)} para ${recipient.fullName} realizado.`)
      setRecipient(null)
      setPixKeyInput('')
      setDisplay('')
      setAmount(0)
      setTick((t) => t + 1)
      setStep('home')
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no Pix.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bank-feature" data-testid="pix-panel">
      <h3>Área Pix</h3>
      <p className="bank-feature__sub">Crie chaves, transfira e acompanhe seus movimentos.</p>

      {error ? (
        <div className="auth-alert" role="alert">
          {error}
        </div>
      ) : null}
      {success ? <div className="success-banner">{success}</div> : null}

      {step === 'home' ? (
        <>
          <div className="bank-feature__actions">
            <Button variant="gold" onClick={() => setStep('create')}>
              Criar chave Pix
            </Button>
            <Button variant="primary" onClick={() => setStep('transfer')}>
              Transferir por chave
            </Button>
          </div>

          <div className="bank-feature__block">
            <h4>Minhas chaves</h4>
            {keys.length === 0 ? (
              <p className="bank-feature__meta">Nenhuma chave cadastrada.</p>
            ) : (
              <ul className="bank-list">
                {keys.map((k) => (
                  <li key={k.id}>
                    <strong>{k.type}</strong>
                    <span>{k.key}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bank-feature__block">
            <h4>Últimos movimentos Pix (máx. 20)</h4>
            {history.length === 0 ? (
              <p className="bank-feature__meta">Sem registros ainda.</p>
            ) : (
              <ul className="bank-list" data-testid="pix-history">
                {history.map((entry) => (
                  <li key={entry.id}>
                    <div>
                      <strong>{entry.title}</strong>
                      <span>{entry.description}</span>
                      <small>{new Date(entry.createdAt).toLocaleString('pt-BR')}</small>
                    </div>
                    <em className={entry.signedAmount < 0 ? 'is-out' : 'is-in'}>
                      {formatBRL(entry.amount)}
                    </em>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : null}

      {step === 'create' ? (
        <div className="bank-feature__form">
          <Select
            label="Tipo de chave"
            name="pixType"
            value={keyType}
            onChange={(e) => setKeyType(e.target.value as PixKeyType)}
            options={[
              { value: 'email', label: 'E-mail' },
              { value: 'cpf', label: 'CPF' },
              { value: 'phone', label: 'Telefone' },
              { value: 'random', label: 'Aleatória' },
            ]}
          />
          {keyType !== 'random' && keyType !== 'email' ? (
            <Input
              label="Chave"
              name="pixKey"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
            />
          ) : null}
          {keyType === 'email' ? (
            <p className="bank-feature__meta">Será usada: {user.email}</p>
          ) : null}
          <div className="bank-feature__actions">
            <Button variant="gold" disabled={busy} onClick={handleCreateKey}>
              {busy ? 'Salvando…' : 'Salvar chave'}
            </Button>
            <Button variant="ghost" onClick={() => setStep('home')}>
              Voltar
            </Button>
          </div>
        </div>
      ) : null}

      {step === 'transfer' ? (
        <div className="bank-feature__form">
          <Input
            label="Chave Pix do destinatário"
            name="destKey"
            value={pixKeyInput}
            onChange={(e) => setPixKeyInput(e.target.value)}
          />
          <CurrencyInput
            label="Valor"
            value={display}
            onChange={(formatted, numeric) => {
              setDisplay(formatted)
              setAmount(numeric)
            }}
          />
          <div className="bank-feature__actions">
            <Button
              variant="gold"
              disabled={busy || !pixKeyInput || amount <= 0}
              onClick={handleLookup}
            >
              {busy ? 'Consultando…' : 'Continuar'}
            </Button>
            <Button variant="ghost" onClick={() => setStep('home')}>
              Voltar
            </Button>
          </div>
        </div>
      ) : null}

      {step === 'confirm' && recipient ? (
        <div className="bank-feature__confirm" data-testid="pix-confirm">
          <h4>Confirmar Pix</h4>
          <div className="bank-info-list">
            <div className="bank-info-row">
              <span>Nome</span>
              <span>{recipient.fullName}</span>
            </div>
            <div className="bank-info-row">
              <span>Chave</span>
              <span>{resolvedKey}</span>
            </div>
            <div className="bank-info-row">
              <span>Conta</span>
              <span>{recipient.accountNumber}</span>
            </div>
            <div className="bank-info-row">
              <span>Agência</span>
              <span>{recipient.agency}</span>
            </div>
            <div className="bank-info-row">
              <span>Valor</span>
              <span>{formatBRL(amount)}</span>
            </div>
            <div className="bank-info-row">
              <span>Quando</span>
              <span>{new Date().toLocaleString('pt-BR')}</span>
            </div>
          </div>
          <div className="bank-feature__actions">
            <Button variant="gold" disabled={busy} onClick={handleConfirmTransfer}>
              {busy ? 'Enviando…' : 'Confirmar transferência'}
            </Button>
            <Button variant="ghost" onClick={() => setStep('transfer')}>
              Voltar
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
