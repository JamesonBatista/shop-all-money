import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AnimatedBackground } from '../../components/layout/AnimatedBackground'
import { BackButton } from '../../components/ui/BackButton'
import { Button } from '../../components/ui/Button'
import { useCart } from '../../context/CartContext'
import { CATEGORIES } from '../../data/categories'
import './Shop.css'

export function CategoryGrid() {
  const navigate = useNavigate()
  const { count } = useCart()

  return (
    <div className="shop-page">
      <AnimatedBackground />
      <div className="shop-wrap">
        <div className="shop-head">
          <div>
            <BackButton to="/banco" label="Voltar ao banco" />
            <h1>Loja Bank Shop</h1>
            <p>Escolha o universo que deseja explorar — cada nicho abre lojas com identidade própria.</p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/carrinho')}>
            Carrinho ({count})
          </Button>
        </div>

        <div className="category-grid">
          {CATEGORIES.map((category, index) => (
            <motion.button
              key={category.id}
              type="button"
              className="category-tile"
              style={{ ['--tile-image' as string]: `url(${category.image})` }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.015 }}
              onClick={() => navigate(`/loja/${category.id}`)}
            >
              <strong>{category.name}</strong>
              <span>{category.description}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
