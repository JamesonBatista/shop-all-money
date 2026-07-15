import { useMemo } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { getUserPurchases } from '../../../services/bankingOps'
import { formatBRL } from '../../../utils/currency'

export function CardsPanel() {
  const { user } = useAuth()
  const purchases = useMemo(() => (user ? getUserPurchases(user.id) : []), [user])

  if (!user) return null

  return (
    <div className="bank-feature" data-testid="cards-panel">
      <h3>Cartões · Histórico de compras</h3>
      <p className="bank-feature__sub">
        Compras realizadas com o cartão {user.cardOperator} no marketplace Bank Shop.
      </p>
      {purchases.length === 0 ? (
        <p className="bank-feature__meta">Nenhuma compra registrada ainda.</p>
      ) : (
        <ul className="bank-list">
          {purchases.map((purchase) => (
            <li key={purchase.id}>
              <div>
                <strong>{purchase.storeName}</strong>
                <span>
                  {purchase.items.map((i) => i.name).join(', ')}
                </span>
                <small>
                  {new Date(purchase.createdAt).toLocaleDateString('pt-BR')} ·{' '}
                  {new Date(purchase.createdAt).toLocaleTimeString('pt-BR')}
                </small>
              </div>
              <em className="is-out">{formatBRL(purchase.total)}</em>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
