import { useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { CurrencyInput } from '../../../components/ui/CurrencyInput'
import { Input } from '../../../components/ui/Input'
import { useAuth } from '../../../context/AuthContext'
import { transferByAccount } from '../../../services/bankingOps'
import { formatBRL } from '../../../utils/currency'

interface TransferPanelProps {
  onDone: () => void
}

export function TransferPanel({ onDone }: TransferPanelProps) {
  const { user, refreshUser } = useAuth()
  const [accountNumber, setAccountNumber] = useState('')
  const [display, setDisplay] = useState('')
  const [amount, setAmount] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)

  if (!user) return null

  async function submit() {
    if (!user) return
    const account = user
    setError('')
    setSuccess('')
    setBusy(true)
    try {
      const { to } = await transferByAccount({ from: account, accountNumber, amount })
      await refreshUser()
      setSuccess(`Transferência de ${formatBRL(amount)} para ${to.fullName} concluída.`)
      setAccountNumber('')
      setDisplay('')
      setAmount(0)
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha na transferência.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bank-feature" data-testid="transfer-panel">
      <h3>Transferir entre contas</h3>
      <p className="bank-feature__sub">
        Informe o número da conta destinária (ex.: {user.accountNumber}) e o valor do Pix/TED.
      </p>
      {error ? (
        <div className="auth-alert" role="alert">
          {error}
        </div>
      ) : null}
      {success ? <div className="success-banner">{success}</div> : null}
      <Input
        label="Número da conta"
        name="accountNumber"
        placeholder="00000-000"
        value={accountNumber}
        onChange={(e) => setAccountNumber(e.target.value)}
      />
      <CurrencyInput
        label="Valor"
        value={display}
        onChange={(formatted, numeric) => {
          setDisplay(formatted)
          setAmount(numeric)
        }}
      />
      <p className="bank-feature__meta">Saldo disponível: {formatBRL(user.balance)}</p>
      <Button variant="gold" disabled={busy || amount <= 0 || !accountNumber} onClick={submit}>
        {busy ? 'Transferindo…' : 'Confirmar transferência'}
      </Button>
    </div>
  )
}
