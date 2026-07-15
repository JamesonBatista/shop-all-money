import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatedBackground } from '../../components/layout/AnimatedBackground'
import { BackButton } from '../../components/ui/BackButton'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { getStoreById } from '../../data/stores'
import { savePurchase } from '../../firebase/purchases'
import { sendPurchaseEmail } from '../../services/emailService'
import type { PurchaseRecord } from '../../types'
import { formatBRL } from '../../utils/currency'
import './Shop.css'

export function CartPage() {
  const { user, debit } = useAuth()
  const { items, total, removeItem, updateQuantity, clearCart } = useCart()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  if (!user) return null

  async function checkout() {
    if (!items.length || !user) return
    const account = user
    setBusy(true)
    setError('')
    setMessage('')

    try {
      await debit(total)

      const primaryStore = getStoreById(items[0].storeId)
      const theme = primaryStore?.theme ?? {
        primary: '#1f6f6a',
        secondary: '#1b3a5c',
        accent: '#c9a36a',
        background: '#06101c',
        text: '#f3efe6',
        surface: '#12263f',
        fontDisplay: '"Cormorant Garamond", serif',
      }
      const storeName = primaryStore?.name ?? items[0].storeName

      const emailStatus = await sendPurchaseEmail({
        to: account.email,
        customerName: account.fullName,
        storeName,
        items,
        total,
        theme,
      })

      const record: PurchaseRecord = {
        id: crypto.randomUUID(),
        userId: account.id,
        userEmail: account.email,
        items: [...items],
        total,
        storeTheme: theme,
        storeName,
        createdAt: new Date().toISOString(),
        emailStatus,
      }

      await savePurchase(record)
      clearCart()
      setMessage(
        emailStatus === 'sent'
          ? `Compra concluída! Confirmação enviada para ${account.email}.`
          : `Compra concluída! Confirmamos o abatimento e preparamos o e-mail para ${account.email}.`,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível concluir a compra.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="cart-page">
      <AnimatedBackground />
      <div className="cart-layout">
        <div className="shop-head">
          <div>
            <BackButton label="Voltar" />
            <h1>Carrinho</h1>
            <p>Saldo atual: {formatBRL(user.balance)}</p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/banco')}>
            Ir ao banco
          </Button>
        </div>

        {message ? <div className="success-banner">{message}</div> : null}
        {error ? <div className="auth-alert">{error}</div> : null}

        {!items.length && !message ? (
          <div className="cart-empty">
            <p>Seu carrinho está vazio.</p>
            <Button variant="gold" onClick={() => navigate('/loja')}>
              Explorar lojas
            </Button>
          </div>
        ) : null}

        {items.map((item) => (
          <motion.div
            key={item.productId}
            className="cart-item"
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <img src={item.image} alt={item.name} />
            <div>
              <h3>{item.name}</h3>
              <p>
                {item.storeName} · {formatBRL(item.price)}
              </p>
              <div className="qty-controls">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  aria-label="Diminuir"
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  aria-label="Aumentar"
                >
                  +
                </button>
              </div>
            </div>
            <div className="cart-item__side">
              <strong>{formatBRL(item.price * item.quantity)}</strong>
              <Button variant="danger" onClick={() => removeItem(item.productId)}>
                Remover
              </Button>
            </div>
          </motion.div>
        ))}

        {items.length ? (
          <div className="cart-summary">
            <div className="cart-summary__total">
              <span>Total</span>
              <span>{formatBRL(total)}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
              <Button variant="gold" onClick={checkout} disabled={busy}>
                {busy ? 'Processando…' : 'Finalizar compra'}
              </Button>
              <Button variant="ghost" onClick={() => navigate('/loja')}>
                Continuar comprando
              </Button>
            </div>
          </div>
        ) : null}

        {message ? (
          <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
            <Button variant="gold" onClick={() => navigate('/banco')}>
              Ver saldo atualizado
            </Button>
            <Button variant="secondary" onClick={() => navigate('/loja')}>
              Voltar à loja
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
