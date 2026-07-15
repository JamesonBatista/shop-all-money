import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatedBackground } from '../../components/layout/AnimatedBackground'
import { BackButton } from '../../components/ui/BackButton'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { getStoreById } from '../../data/stores'
import { trackPurchase } from '../../firebase/analytics'
import { savePurchase } from '../../firebase/purchases'
import { recordPurchaseLedger } from '../../services/bankingOps'
import { sendPurchaseEmail } from '../../services/emailService'
import type { PurchaseRecord } from '../../types'
import { formatBRL } from '../../utils/currency'
import './Shop.css'

type PayState = 'idle' | 'waiting' | 'success' | 'error'

export function CartPage() {
  const { user, debit } = useAuth()
  const { items, total, removeItem, updateQuantity, clearCart } = useCart()
  const navigate = useNavigate()
  const [payState, setPayState] = useState<PayState>('idle')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  if (!user) return null

  async function checkout() {
    if (!items.length || !user) return
    const account = user
    setError('')
    setMessage('')
    setPayState('waiting')

    // Intentional bank-like waiting UX
    await new Promise((resolve) => window.setTimeout(resolve, 1200))

    try {
      if (total > account.balance) {
        throw new Error('Saldo insuficiente.')
      }

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
      const createdAt = new Date().toISOString()

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
        createdAt,
        emailStatus,
      }

      await savePurchase(record)
      await recordPurchaseLedger({
        userId: account.id,
        storeName,
        total,
        createdAt,
      })
      await trackPurchase(total, storeName)
      clearCart()
      setPayState('success')
      setMessage(
        emailStatus === 'sent'
          ? `Compra realizada! Detalhes enviados para ${account.email}.`
          : `Compra realizada! Confirmamos o abatimento e preparamos o e-mail para ${account.email}.`,
      )
    } catch (err) {
      setPayState('error')
      setError(err instanceof Error ? err.message : 'Não foi possível concluir a compra.')
    }
  }

  const popupOpen = payState === 'waiting' || payState === 'success' || payState === 'error'

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

        {message && payState !== 'success' ? <div className="success-banner">{message}</div> : null}
        {error && payState !== 'error' ? <div className="auth-alert">{error}</div> : null}

        {!items.length && payState !== 'success' ? (
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
              <Button variant="gold" onClick={checkout} disabled={payState === 'waiting'}>
                Pagar agora
              </Button>
              <Button variant="ghost" onClick={() => navigate('/loja')}>
                Continuar comprando
              </Button>
            </div>
          </div>
        ) : null}

        {payState === 'success' ? (
          <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
            <Button
              variant="gold"
              onClick={() => {
                setPayState('idle')
                navigate('/banco')
              }}
            >
              Ver saldo atualizado
            </Button>
            <Button variant="secondary" onClick={() => navigate('/loja')}>
              Voltar à loja
            </Button>
          </div>
        ) : null}
      </div>

      <Modal
        open={popupOpen}
        title="Bank Shop Pay"
        onClose={() => {
          if (payState === 'waiting') return
          setPayState('idle')
          if (payState === 'error') setError('')
        }}
      >
        <div className="pay-popup" data-testid="pay-popup">
          {payState === 'waiting' ? (
            <>
              <div className="pay-popup__spinner" aria-hidden="true" />
              <p data-testid="pay-waiting">Aguardando Bank Shop...</p>
            </>
          ) : null}
          {payState === 'success' ? (
            <>
              <p className="pay-popup__success" data-testid="pay-success">
                Compra realizada
              </p>
              <p>{message}</p>
              <Button
                variant="gold"
                onClick={() => {
                  setPayState('idle')
                  navigate('/banco')
                }}
              >
                Ir ao banco
              </Button>
            </>
          ) : null}
          {payState === 'error' ? (
            <>
              <p className="auth-alert" role="alert">
                {error}
              </p>
              <Button variant="ghost" onClick={() => setPayState('idle')}>
                Fechar
              </Button>
            </>
          ) : null}
        </div>
      </Modal>
    </div>
  )
}
