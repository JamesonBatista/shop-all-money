import { motion } from 'framer-motion'
import { useState, type CSSProperties, type ReactNode } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { getProductsByStore } from '../../data/products'
import { getStoreById } from '../../data/stores'
import type { ChromeStyle, Product, Store, StoreLayout } from '../../types'
import { formatBRL } from '../../utils/currency'
import './Shop.css'

function themeVars(store: Store): CSSProperties {
  const theme = store.theme
  return {
    '--store-bg': theme.background,
    '--store-text': theme.text,
    '--store-surface': theme.surface,
    '--store-accent': theme.accent,
    '--store-primary': theme.primary,
    '--store-secondary': theme.secondary,
    '--store-font': theme.fontDisplay,
    '--store-pattern': theme.pattern || 'none',
    '--store-hero': `url(${store.heroImage})`,
    '--card-bg': theme.cardBg ?? theme.surface,
    '--card-text': theme.cardText ?? theme.text,
    '--card-muted': theme.cardMuted ?? 'color-mix(in srgb, var(--store-text) 65%, transparent)',
  } as CSSProperties
}

function ChromeButton({
  style,
  children,
  onClick,
  testId,
}: {
  style: ChromeStyle
  children: ReactNode
  onClick: () => void
  testId?: string
}) {
  return (
    <button
      type="button"
      className={`store-chrome-btn store-chrome-btn--${style}`}
      onClick={onClick}
      data-testid={testId}
    >
      {children}
    </button>
  )
}

function ProductCard({
  product,
  store,
  layout,
  index,
  onAdd,
}: {
  product: Product
  store: Store
  layout: StoreLayout
  index: number
  onAdd: () => void
}) {
  const isStudio = layout === 'editorial-light' || layout === 'editorial-dark' || layout === 'catalog'
  const isLineup = layout === 'lineup'
  const cta = store.cta

  return (
    <motion.article
      className={`product-card product-card--${layout}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.28), duration: 0.4 }}
    >
      <div className="product-card__media-wrap">
        {isStudio || isLineup ? (
          <img
            className="product-card__img"
            src={product.image}
            alt={product.name}
            loading="lazy"
          />
        ) : (
          <div
            className="product-card__media"
            style={{ backgroundImage: `url(${product.image})` }}
          />
        )}
        {product.badge ? <span className="product-card__badge">{product.badge}</span> : null}
        {isLineup ? (
          <div className="product-card__lineup-overlay">
            <h3>{product.name}</h3>
            <p>{product.description}</p>
          </div>
        ) : null}
      </div>
      {!isLineup ? (
        <div className="product-card__body">
          <h3>{product.name}</h3>
          <p className="product-card__subtitle">{product.description}</p>
          {product.material ? (
            <p className="product-card__material">{product.material}</p>
          ) : (
            <p className="product-card__material product-card__material--spacer" aria-hidden>
              &nbsp;
            </p>
          )}
          <div className="product-card__row">
            <span className="product-card__price">{formatBRL(product.price)}</span>
            <button
              type="button"
              className={`store-cta store-cta--${cta.style}`}
              data-testid={`buy-${product.id}`}
              onClick={onAdd}
            >
              {cta.label}
            </button>
          </div>
        </div>
      ) : (
        <div className="product-card__body product-card__body--lineup">
          <div className="product-card__row">
            <span className="product-card__price">{formatBRL(product.price)}</span>
            <button
              type="button"
              className={`store-cta store-cta--${cta.style}`}
              data-testid={`buy-${product.id}`}
              onClick={onAdd}
            >
              {cta.label}
            </button>
          </div>
        </div>
      )}
    </motion.article>
  )
}

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

  const layout = store.layout
  const isEditorial = layout === 'editorial-light' || layout === 'editorial-dark'
  const heroTitle = store.heroTitle ?? store.name
  const chrome = store.chrome
  const metaLabel =
    layout === 'lineup'
      ? 'models in line-up'
      : layout === 'catalog'
        ? 'products'
        : 'models displayed.'

  return (
    <div className={`store-theme-page store-theme-page--${layout}`} style={themeVars(store)}>
      <header className={`store-theme-hero store-theme-hero--${layout}`}>
        {isEditorial || layout === 'lineup' ? (
          <div className="store-theme-hero__gradient" aria-hidden />
        ) : null}
        <div className="store-theme-hero__inner">
          <p className="store-theme-hero__eyebrow">{store.heroEyebrow ?? 'Collection'}</p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            {heroTitle}
          </motion.h1>
          <p className="store-theme-hero__desc">{store.description}</p>
        </div>
      </header>

      <div className="store-theme-content">
        <div className="store-theme-toolbar" data-testid="store-chrome">
          <ChromeButton
            style={chrome.style}
            testId="store-back"
            onClick={() => navigate(`/loja/${categoryId}`)}
          >
            ← {chrome.backLabel}
          </ChromeButton>
          <div className="store-theme-toolbar__actions">
            <ChromeButton
              style={chrome.style}
              testId="store-cart"
              onClick={() => navigate('/carrinho')}
            >
              {chrome.cartLabel} ({count})
            </ChromeButton>
            <ChromeButton style={chrome.style} onClick={() => navigate('/banco')}>
              Bank Shop
            </ChromeButton>
          </div>
        </div>

        {flash ? <div className="success-banner">{flash}</div> : null}

        <div className="store-catalog-meta">
          <span>
            <span className="store-catalog-meta__count">{products.length}</span> {metaLabel}
          </span>
        </div>

        <div className={`product-grid product-grid--${layout}`}>
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              store={store}
              layout={layout}
              index={index}
              onAdd={() => {
                addItem(product, store)
                setFlash(`${product.name} adicionado à sacola.`)
                window.setTimeout(() => setFlash(''), 2200)
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
