import { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { trackVisit } from './firebase/analytics'
import { runSilentBankBootstrap } from './firebase/bootstrap'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { BankDashboard } from './pages/bank/BankDashboard'
import { CartPage } from './pages/shop/CartPage'
import { CategoryGrid } from './pages/shop/CategoryGrid'
import { StoreList } from './pages/shop/StoreList'
import { StorePage } from './pages/shop/StorePage'

function AppRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        className="page-transition"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route
            path="/banco"
            element={
              <ProtectedRoute>
                <BankDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/loja"
            element={
              <ProtectedRoute>
                <CategoryGrid />
              </ProtectedRoute>
            }
          />
          <Route
            path="/loja/:categoryId"
            element={
              <ProtectedRoute>
                <StoreList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/loja/:categoryId/:storeId"
            element={
              <ProtectedRoute>
                <StorePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/carrinho"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  useEffect(() => {
    void runSilentBankBootstrap()
    void trackVisit()
  }, [])

  return (
    <HashRouter>
      <AuthProvider>
        <CartProvider>
          <div className="app-shell">
            <AppRoutes />
          </div>
        </CartProvider>
      </AuthProvider>
    </HashRouter>
  )
}
