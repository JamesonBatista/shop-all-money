import { useMemo } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { getUserStatement } from '../../../services/bankingOps'
import { formatBRL } from '../../../utils/currency'

export function StatementPanel() {
  const { user } = useAuth()
  const entries = useMemo(() => (user ? getUserStatement(user.id) : []), [user])

  if (!user) return null

  return (
    <div className="bank-feature" data-testid="statement-panel">
      <h3>Extrato</h3>
      <p className="bank-feature__sub">
        Movimentações da conta — Pix, transferências, compras, depósitos e rendimentos.
      </p>
      {entries.length === 0 ? (
        <p className="bank-feature__meta">Nenhuma movimentação ainda.</p>
      ) : (
        <ul className="bank-list" data-testid="statement-list">
          {entries.map((entry) => (
            <li key={entry.id}>
              <div>
                <strong>{entry.title}</strong>
                <span>{entry.description}</span>
                <small>{new Date(entry.createdAt).toLocaleString('pt-BR')}</small>
              </div>
              <em className={entry.signedAmount < 0 ? 'is-out' : 'is-in'}>
                {entry.signedAmount < 0 ? '−' : '+'}
                {formatBRL(entry.amount)}
              </em>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
