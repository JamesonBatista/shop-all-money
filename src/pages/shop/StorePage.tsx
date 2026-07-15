import { motion } from 'framer-motion'
import { useState, type CSSProperties } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { BackButton } from '../../components/ui/BackButton'
import { Button } from '../../components/ui/Button'
import { useCart } from '../../context/CartContext'
import { getProductsByStore } from '../../data/products'
import { getStoreById } from '../../data/stores'
import { formatBRL } from '../../utils/currency'
import './Shop.css'

export function StorePage() {
  const { categoryId = '', storeId = '' } = useParams()
  const navigate = useNavigate()
  const { addItem, count } = useCart()
  const store = getStoreById(storeId)
  const products = getProductsByStore(storeId)
  const [flash, setFlash] = useState('')

  if (!store || store.categoryId !== categoryId) {
    return <Navigate to="/loja" replace />
  }

  const theme = store.theme
  const cta = store.cta

  return (
    <div
      className="store-theme-page"
      style={
        {
          '--store-bg': theme.background,
          '--store-text': theme.text,
          '--store-surface': theme.surface,
          '--store-accent': theme.accent,
          '--store-primary': theme.primary,
          '--store-secondary': theme.secondary,
          '--store-font': theme.fontDisplay,
          '--store-pattern': theme.pattern || 'none',
          '--store-hero': `url(${store.heroImage})`,
        } as CSSProperties
      }
    >
      <header className="store-theme-hero">
        <div className="store-theme-hero__inner">
          <div className="store-theme-hero__badge">{store.logoInitials} · Boutique</div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            {store.name}
          </motion.h1>
          <p>{store.description}</p>
        </div>
      </header>

      <div className="store-theme-content">
        <div className="store-theme-toolbar">
          <BackButton to={`/loja/${categoryId}`} label="Voltar às lojas" />
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <Button variant="secondary" onClick={() => navigate('/carrinho')}>
              Sacola ({count})
            </Button>
            <Button variant="ghost" onClick={() => navigate('/banco')}>
              Banco
            </Button>
          </div>
        </div>

        {flash ? <div className="success-banner">{flash}</div> : null}

        <div className="product-grid">
          {products.map((product, index) => (
            <motion.article
              key={product.id}
              className="product-card"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.03, 0.3) }}
            >
              <div
                className="product-card__media"
                style={{ backgroundImage: `url(${product.image})` }}
              />
              <div className="product-card__body">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div className="product-card__row">
                  <span className="product-card__price">{formatBRL(product.price)}</span>
                  <button
                    type="button"
                    className={`store-cta store-cta--${cta.style}`}
                    data-testid={`buy-${product.id}`}
                    onClick={() => {
                      addItem(product, store)
                      setFlash(`${product.name} adicionado à sacola.`)
                      window.setTimeout(() => setFlash(''), 2200)
                    }}
                  >
                    {cta.label}
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  )
}
