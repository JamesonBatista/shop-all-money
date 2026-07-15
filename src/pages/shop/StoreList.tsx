import { motion } from 'framer-motion'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { AnimatedBackground } from '../../components/layout/AnimatedBackground'
import { BackButton } from '../../components/ui/BackButton'
import { Button } from '../../components/ui/Button'
import { useCart } from '../../context/CartContext'
import { CATEGORIES } from '../../data/categories'
import { getStoresByCategory } from '../../data/stores'
import './Shop.css'

export function StoreList() {
  const { categoryId = '' } = useParams()
  const navigate = useNavigate()
  const { count } = useCart()
  const category = CATEGORIES.find((c) => c.id === categoryId)
  const stores = getStoresByCategory(categoryId)

  if (!category) return <Navigate to="/loja" replace />

  return (
    <div className="shop-page">
      <AnimatedBackground />
      <div className="shop-wrap">
        <div className="shop-head">
          <div>
            <BackButton to="/loja" label="Voltar às categorias" />
            <h1>{category.name}</h1>
            <p>
              {category.id === 'relogios'
                ? 'As maisons mais exclusivas do mundo — Patek, Richard Mille, AP, Vacheron e Rolex.'
                : `As marcas e casas mais caras do mundo em ${category.name.toLowerCase()}.`}
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/carrinho')}>
            Carrinho ({count})
          </Button>
        </div>

        <div className="store-grid">
          {stores.map((store, index) => (
            <motion.button
              key={store.id}
              type="button"
              className="store-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              onClick={() => navigate(`/loja/${categoryId}/${store.id}`)}
            >
              <div
                className="store-card__media"
                style={{ backgroundImage: `url(${store.heroImage})` }}
              >
                <div
                  className="store-card__logo"
                  style={{
                    background: store.theme.primary,
                    color: store.theme.accent,
                  }}
                >
                  {store.logoInitials}
                </div>
              </div>
              <div className="store-card__body">
                <h3>{store.name}</h3>
                <p>{store.tagline}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
